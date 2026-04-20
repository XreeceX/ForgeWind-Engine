import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpsertUserDto {
  @IsString()
  @MinLength(1)
  githubId!: string;

  @IsString()
  @MinLength(1)
  username!: string;

  @IsString()
  @MinLength(1)
  avatarUrl!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
