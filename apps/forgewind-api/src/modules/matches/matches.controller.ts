import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';
import { UpdateMatchStatusDto } from './matches.dto';
import { MatchesService } from './matches.service';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedForgeWindUser) {
    return this.matches.listForUser(user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedForgeWindUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateMatchStatusDto,
  ) {
    return this.matches.updateStatus(user.id, id, body.status);
  }
}
