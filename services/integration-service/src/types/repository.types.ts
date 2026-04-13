export interface RepositoryImportInput {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  metadata: Record<string, unknown>;
}
