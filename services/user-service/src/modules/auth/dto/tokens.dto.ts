import { IsString, MinLength } from 'class-validator';

export class TokensDto {
  accessToken!: string;
  refreshToken!: string;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
