import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';
import { GenerateNarrativeDto, ListNarrativesQueryDto, PinNarrativeDto } from './narratives.dto';
import { NarrativesService } from './narratives.service';

@Controller('narratives')
@UseGuards(JwtAuthGuard)
export class NarrativesController {
  constructor(private readonly narratives: NarrativesService) {}

  @Post('generate')
  generate(@CurrentUser() user: AuthenticatedForgeWindUser, @Body() body: GenerateNarrativeDto) {
    return this.narratives.generate(user.id, body);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedForgeWindUser, @Query() query: ListNarrativesQueryDto) {
    return this.narratives.listForUser(user.id, query.type);
  }

  @Patch(':id/pin')
  pin(
    @CurrentUser() user: AuthenticatedForgeWindUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: PinNarrativeDto,
  ) {
    return this.narratives.setPinned(user.id, id, body.isPinned);
  }
}
