import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { StubUserId } from '../../common/decorators/stub-user-id.decorator';
import { ActivateRepositoryDto, ConnectRepositoryDto } from './repositories.dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositories: RepositoriesService) {}

  @Post()
  connect(@StubUserId() userId: string, @Body() body: ConnectRepositoryDto) {
    return this.repositories.connect(userId, body);
  }

  @Get()
  list(@StubUserId() userId: string) {
    return this.repositories.listForUser(userId);
  }

  @Delete(':id')
  disconnect(
    @StubUserId() userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.repositories.disconnect(userId, id);
  }

  @Patch(':id/activate')
  activate(
    @StubUserId() userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: ActivateRepositoryDto,
  ) {
    return this.repositories.setActive(userId, id, body.isActive);
  }
}
