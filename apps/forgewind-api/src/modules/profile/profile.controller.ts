import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';
import { ProfileProxyService } from './profile-proxy.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileProxy: ProfileProxyService) {}

  @Get('me')
  getMe(
    @CurrentUser() user: AuthenticatedForgeWindUser,
    @Headers('authorization') authorization?: string,
  ) {
    return this.profileProxy.getProfile(user.externalUserId, authorization);
  }
}

@Controller('career')
@UseGuards(JwtAuthGuard)
export class CareerJobsController {
  constructor(private readonly profileProxy: ProfileProxyService) {}

  @Get('jobs')
  searchJobs(
    @CurrentUser() _user: AuthenticatedForgeWindUser,
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profileProxy.searchJobs({
      query: query ?? '',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }
}
