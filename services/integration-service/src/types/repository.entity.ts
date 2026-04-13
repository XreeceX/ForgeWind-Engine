export class RepositoryEntity {
  id!: string;
  userId!: string;
  name!: string;
  description!: string | null;
  language!: string | null;
  stars!: number;
  metadata!: unknown;
}
