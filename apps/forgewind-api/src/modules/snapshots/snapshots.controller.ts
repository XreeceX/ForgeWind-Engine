import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';
import { SnapshotsService } from './snapshots.service';

@Controller('repositories')
@UseGuards(JwtAuthGuard)
export class SnapshotsController {
  constructor(private readonly snapshots: SnapshotsService) {}

  @Post(':id/sync')
  sync(
    @CurrentUser() user: AuthenticatedForgeWindUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.snapshots.syncRepository(user.id, id);
  }

  @Get(':id/snapshots')
  list(
    @CurrentUser() user: AuthenticatedForgeWindUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.snapshots.listSnapshots(user.id, id);
  }
}
