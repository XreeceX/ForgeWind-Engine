export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
}

export class DeterministicEmbeddingService implements EmbeddingService {
  constructor(private readonly dimensions = 128) {}

  async embed(text: string): Promise<number[]> {
    const output = new Array<number>(this.dimensions).fill(0);
    const normalized = text.toLowerCase();

    for (let i = 0; i < normalized.length; i++) {
      const code = normalized.charCodeAt(i);
      const bucket = i % this.dimensions;
      output[bucket] = (output[bucket] ?? 0) + code / 255;
    }

    const magnitude = Math.sqrt(output.reduce((sum, v) => sum + v * v, 0)) || 1;
    return output.map((v) => v / magnitude);
  }
}
