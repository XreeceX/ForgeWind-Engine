import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  UpdateUserDto,
  UpdateCareerGoalsDto,
  UserProfileResponse,
  CareerGoalsResponse,
  ExperienceLevel,
} from './user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  @Get('me')
  @ApiOperation({ summary: 'Get own user profile' })
  @ApiOkResponse({ description: 'User profile retrieved' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getMe(@CurrentUser() user: AuthenticatedUser): UserProfileResponse {
    // TODO: Forward to user-service GET /users/:id
    return {
      id: user.sub,
      email: user.email,
      firstName: 'Jane',
      lastName: 'Doe',
      headline: 'Full-stack developer focused on AI products',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/janedoe',
      roles: user.roles,
      careerGoals: {
        targetRole: 'Senior Frontend Engineer',
        targetIndustries: ['fintech', 'ai'],
        targetLevel: ExperienceLevel.SENIOR,
        salaryMin: 150000,
        salaryMax: 220000,
        openToRemote: true,
        preferredLocations: ['San Francisco', 'Remote'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiOkResponse({ description: 'Profile updated' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): UserProfileResponse {
    // TODO: Forward to user-service PATCH /users/:id
    return {
      id: user.sub,
      email: user.email,
      firstName: dto.firstName ?? 'Jane',
      lastName: dto.lastName ?? 'Doe',
      headline: dto.headline ?? 'Full-stack developer focused on AI products',
      location: dto.location ?? 'San Francisco, CA',
      linkedinUrl: dto.linkedinUrl ?? 'https://linkedin.com/in/janedoe',
      roles: user.roles,
      careerGoals: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Patch('me/career-goals')
  @ApiOperation({ summary: 'Update career goals' })
  @ApiOkResponse({ description: 'Career goals updated' })
  updateCareerGoals(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCareerGoalsDto,
  ): CareerGoalsResponse {
    // TODO: Forward to user-service PATCH /users/:id/career-goals
    void user;
    return {
      targetRole: dto.targetRole ?? null,
      targetIndustries: dto.targetIndustries ?? [],
      targetLevel: dto.targetLevel ?? null,
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      openToRemote: dto.openToRemote ?? false,
      preferredLocations: dto.preferredLocations ?? [],
    };
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete own account' })
  @ApiNoContentResponse({ description: 'Account deleted' })
  deleteMe(@CurrentUser() user: AuthenticatedUser): void {
    // TODO: Forward to user-service DELETE /users/:id (soft delete)
    void user;
  }
}
