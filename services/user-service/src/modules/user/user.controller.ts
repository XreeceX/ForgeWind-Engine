import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UpdateCareerGoalsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getFullProfile(user.id);
  }

  /**
   * GET /users/:id — Only allowed for the authenticated user's own ID.
   * Services that need cross-user lookup should use an internal mechanism, not this endpoint.
   */
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (id !== user.id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.userService.findById(id);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUserDto) {
    return this.userService.update(user.id, dto);
  }

  @Patch('me/career-goals')
  async updateCareerGoals(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCareerGoalsDto,
  ) {
    return this.userService.updateCareerGoals(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() user: AuthenticatedUser) {
    await this.userService.softDelete(user.id);
  }
}
