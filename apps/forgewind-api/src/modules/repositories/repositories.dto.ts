import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class ConnectRepositoryDto {
  @IsString()
  @MinLength(1)
  githubRepoId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  fullName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(1)
  language!: string;
}

export class ActivateRepositoryDto {
  @IsBoolean()
  isActive!: boolean;
}
