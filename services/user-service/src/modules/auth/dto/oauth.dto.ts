import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { AuthProvider } from '@prisma/client';

export class OAuthExchangeDto {
  @IsEnum(AuthProvider)
  provider!: AuthProvider;

  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
