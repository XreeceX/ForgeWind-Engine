import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { StubUserId } from '../../common/decorators/stub-user-id.decorator';
import { UpdateMatchStatusDto } from './matches.dto';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get()
  list(@StubUserId() userId: string) {
    return this.matches.listForUser(userId);
  }

  @Patch(':id/status')
  updateStatus(
    @StubUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateMatchStatusDto,
  ) {
    return this.matches.updateStatus(userId, id, body.status);
  }
}
