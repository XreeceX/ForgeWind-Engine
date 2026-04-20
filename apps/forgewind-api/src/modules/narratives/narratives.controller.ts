import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StubUserId } from '../../common/decorators/stub-user-id.decorator';
import {
  GenerateNarrativeDto,
  ListNarrativesQueryDto,
  PinNarrativeDto,
} from './narratives.dto';
import { NarrativesService } from './narratives.service';

@Controller('narratives')
export class NarrativesController {
  constructor(private readonly narratives: NarrativesService) {}

  @Post('generate')
  generate(@StubUserId() userId: string, @Body() body: GenerateNarrativeDto) {
    return this.narratives.generate(userId, body);
  }

  @Get()
  list(
    @StubUserId() userId: string,
    @Query() query: ListNarrativesQueryDto,
  ) {
    return this.narratives.listForUser(userId, query.type);
  }

  @Patch(':id/pin')
  pin(
    @StubUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: PinNarrativeDto,
  ) {
    return this.narratives.setPinned(userId, id, body.isPinned);
  }
}
