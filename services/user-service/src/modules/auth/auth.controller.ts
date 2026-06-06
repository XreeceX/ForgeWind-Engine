import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, OAuthExchangeDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * Called server-side from apps/web after a successful OAuth sign-in.
   * Creates or retrieves the user in user-service and issues a JWT pair.
   * This endpoint is NOT exposed to browsers directly.
   */
  @Post('oauth')
  @HttpCode(HttpStatus.OK)
  async oauthExchange(@Body() dto: OAuthExchangeDto) {
    return this.authService.validateOAuthUser(dto.provider, {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      avatarUrl: dto.avatarUrl,
    });
  }
}
