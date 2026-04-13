import type { EmbeddingService } from "./embedding.service.js";
import type { ContextRetrievalItem, SemanticDocument } from "../memory/memory.types.js";

interface VectorRecord {
  document: SemanticDocument;
  embedding: number[];
}

export interface RetrievalQuery {
  userId: string;
  query: string;
  topK: number;
  semanticWeight?: number;
  recencyWeight?: number;
  maxAgeDays?: number;
}

export interface VectorStore {
  upsert(document: SemanticDocument, embedding: number[]): Promise<void>;
  query(
    userId: string,
    queryEmbedding: number[],
    query: RetrievalQuery,
  ): Promise<ContextRetrievalItem[]>;
}

export class InMemoryVectorStore implements VectorStore {
  private readonly records = new Map<string, VectorRecord[]>();

  async upsert(document: SemanticDocument, embedding: number[]): Promise<void> {
    const userRecords = this.records.get(document.userId) ?? [];
    const remaining = userRecords.filter((rec) => rec.document.id !== document.id);
    this.records.set(document.userId, [{ document, embedding }, ...remaining]);
  }

  async query(
    userId: string,
    queryEmbedding: number[],
    query: RetrievalQuery,
  ): Promise<ContextRetrievalItem[]> {
    const now = Date.now();
    const userRecords = this.records.get(userId) ?? [];
    const maxAgeMs = (query.maxAgeDays ?? 120) * 24 * 60 * 60 * 1000;
    const semanticWeight = query.semanticWeight ?? 0.75;
    const recencyWeight = query.recencyWeight ?? 0.25;

    const scored = userRecords
      .filter((rec) => {
        const age = now - new Date(rec.document.createdAt).getTime();
        return age <= maxAgeMs;
      })
      .map((rec): ContextRetrievalItem => {
        const semanticScore = cosineSimilarity(queryEmbedding, rec.embedding);
        const ageMs = now - new Date(rec.document.createdAt).getTime();
        const recencyScore = Math.max(0, 1 - ageMs / maxAgeMs);
        const finalScore = semanticScore * semanticWeight + recencyScore * recencyWeight;

        return {
          id: rec.document.id,
          content: rec.document.content,
          metadata: rec.document.metadata,
          semanticScore,
          recencyScore,
          finalScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    return scored.slice(0, query.topK);
  }
}

export class RetrievalService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStore,
  ) {}

  async store(document: SemanticDocument): Promise<void> {
    const embedding = await this.embeddingService.embed(document.content);
    await this.vectorStore.upsert(document, embedding);
  }

  async retrieve(query: RetrievalQuery): Promise<ContextRetrievalItem[]> {
    const queryEmbedding = await this.embeddingService.embed(query.query);
    return this.vectorStore.query(query.userId, queryEmbedding, query);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const size = Math.min(a.length, b.length);
  if (size === 0) return 0;

  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let i = 0; i < size; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    aMag += av * av;
    bMag += bv * bv;
  }

  if (aMag === 0 || bMag === 0) return 0;
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}
