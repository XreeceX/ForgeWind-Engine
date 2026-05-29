import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';
import { ActivateRepositoryDto, ConnectRepositoryDto } from './repositories.dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
@UseGuards(JwtAuthGuard)
export class RepositoriesController {
  constructor(private readonly repositories: RepositoriesService) {}

  @Post()
  connect(@CurrentUser() user: AuthenticatedForgeWindUser, @Body() body: ConnectRepositoryDto) {
    return this.repositories.connect(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedForgeWindUser) {
    return this.repositories.listForUser(user.id);
  }

  @Delete(':id')
  disconnect(
    @CurrentUser() user: AuthenticatedForgeWindUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.repositories.disconnect(user.id, id);
  }

  @Patch(':id/activate')
  activate(
    @CurrentUser() user: AuthenticatedForgeWindUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: ActivateRepositoryDto,
  ) {
    return this.repositories.setActive(user.id, id, body.isActive);
  }
}
