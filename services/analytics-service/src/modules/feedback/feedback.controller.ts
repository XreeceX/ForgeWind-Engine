import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FeedbackService } from './services/feedback.service';
import { SubmitFeedbackDto } from '../../common/dto';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit user feedback for a feature' })
  @ApiResponse({ status: 201, description: 'Feedback submitted' })
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    const feedback = await this.feedbackService.collectFeedback(
      dto.userId,
      dto.featureId,
      dto.rating,
      dto.comment ?? null,
      dto.context ?? {},
    );
    return { success: true, feedback };
  }

  @Get('analysis/:userId')
  @ApiOperation({ summary: 'Get feedback analysis for a user' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Feedback analysis generated' })
  async getAnalysis(@Param('userId') userId: string) {
    const analysis = await this.feedbackService.analyzeFeedback(userId);
    return { analysis };
  }
}
