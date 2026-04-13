import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto, RefreshDto, AuthTokens, UserProfile } from './auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  register(@Body() dto: RegisterDto): AuthTokens & { user: UserProfile } {
    // TODO: Forward to user-service register endpoint
    return {
      accessToken: 'stub-access-token',
      refreshToken: 'stub-refresh-token',
      expiresIn: 900,
      user: {
        id: 'usr_stub_001',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: ['user'],
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Login successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): AuthTokens & { user: UserProfile } {
    // TODO: Forward to user-service login endpoint
    return {
      accessToken: 'stub-access-token',
      refreshToken: 'stub-refresh-token',
      expiresIn: 900,
      user: {
        id: 'usr_stub_001',
        email: dto.email,
        firstName: 'Jane',
        lastName: 'Doe',
        roles: ['user'],
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ description: 'Token refreshed' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  refresh(@Body() dto: RefreshDto): AuthTokens {
    // TODO: Forward to user-service token refresh endpoint
    void dto;
    return {
      accessToken: 'stub-new-access-token',
      refreshToken: 'stub-new-refresh-token',
      expiresIn: 900,
    };
  }

  @Get('linkedin')
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth flow' })
  linkedinAuth(@Res() res: Response): void {
    // TODO: Build LinkedIn OAuth URL from config and redirect
    const clientId = this.configService.get<string>('gateway.linkedin.clientId');
    const callbackUrl = this.configService.get<string>('gateway.linkedin.callbackUrl');
    const scope = encodeURIComponent('openid profile email');
    const state = Buffer.from(Date.now().toString()).toString('base64url');

    const linkedinUrl =
      `https://www.linkedin.com/oauth/v2/authorization` +
      `?response_type=code&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl ?? '')}` +
      `&scope=${scope}&state=${state}`;

    res.redirect(linkedinUrl);
  }

  @Get('linkedin/callback')
  @ApiOperation({ summary: 'LinkedIn OAuth callback' })
  linkedinCallback(): AuthTokens & { user: UserProfile } {
    // TODO: Exchange code for token via LinkedIn API, upsert user in user-service
    return {
      accessToken: 'stub-linkedin-access-token',
      refreshToken: 'stub-linkedin-refresh-token',
      expiresIn: 900,
      user: {
        id: 'usr_linkedin_001',
        email: 'linkedin-user@example.com',
        firstName: 'LinkedIn',
        lastName: 'User',
        roles: ['user'],
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'Current user profile' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  me(@CurrentUser() user: AuthenticatedUser): UserProfile {
    // TODO: Fetch full user profile from user-service using user.sub
    return {
      id: user.sub,
      email: user.email,
      firstName: 'Jane',
      lastName: 'Doe',
      roles: user.roles,
      createdAt: new Date().toISOString(),
    };
  }
}
