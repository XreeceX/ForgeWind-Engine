import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpsertUserDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  upsert(@Body() body: UpsertUserDto) {
    return this.users.upsertFromGithub(body);
  }

  @Get(':id')
  getProfile(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.users.findByIdWithRepos(id);
  }
}
