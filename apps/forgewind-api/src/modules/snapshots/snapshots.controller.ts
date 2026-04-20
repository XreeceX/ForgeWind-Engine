import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { StubUserId } from '../../common/decorators/stub-user-id.decorator';
import { SnapshotsService } from './snapshots.service';

@Controller('repositories')
export class SnapshotsController {
  constructor(private readonly snapshots: SnapshotsService) {}

  @Post(':id/sync')
  sync(
    @StubUserId() userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.snapshots.syncRepository(userId, id);
  }

  @Get(':id/snapshots')
  list(
    @StubUserId() userId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.snapshots.listSnapshots(userId, id);
  }
}
