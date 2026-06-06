import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpsertUserDto } from './users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /**
   * POST /users — GitHub upsert (webhook-style, no user JWT required).
   * Only called from the GitHub integration service, not from browsers.
   */
  @Post()
  upsert(@Body() body: UpsertUserDto) {
    return this.users.upsertFromGithub(body);
  }

  /**
   * GET /users/:id — Requires JWT; returns only the authenticated user's own profile.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @CurrentUser() currentUser: AuthenticatedForgeWindUser,
  ) {
    // Scope: user can only fetch their own ForgeWind profile.
    if (id !== currentUser.id) {
      return this.users.findByIdWithRepos(currentUser.id);
    }
    return this.users.findByIdWithRepos(id);
  }
}
