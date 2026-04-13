import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SchedulerService } from './services/scheduler.service';
import {
  CreateReminderDto,
  UpdateReminderDto,
  CreateScheduleDto,
  GetRemindersQueryDto,
  GetSchedulesQueryDto,
} from '../../common/dto';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly scheduler: SchedulerService) {}

  @Post('reminders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'Reminder created' })
  async createReminder(@Body() dto: CreateReminderDto) {
    const reminder = await this.scheduler.createReminder({
      userId: dto.userId,
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      type: dto.type,
    });
    return { success: true, reminder };
  }

  @Get('reminders')
  @ApiOperation({ summary: 'List reminders for a user' })
  @ApiResponse({ status: 200, description: 'Reminders retrieved' })
  async getReminders(@Query() query: GetRemindersQueryDto) {
    const reminders = await this.scheduler.getReminders(query.userId);
    return { reminders, total: reminders.length };
  }

  @Patch('reminders/:id')
  @ApiOperation({ summary: 'Update or complete a reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'Reminder updated' })
  async updateReminder(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @Query('userId') userId: string,
  ) {
    const reminder = await this.scheduler.updateReminder(userId, id, {
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      completed: dto.completed,
    });
    return { success: true, reminder };
  }

  @Post('schedules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a recurring schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created' })
  async createSchedule(@Body() dto: CreateScheduleDto) {
    const schedule = await this.scheduler.createSchedule({
      userId: dto.userId,
      name: dto.name,
      description: dto.description,
      frequency: dto.frequency,
      actions: dto.actions,
    });
    return { success: true, schedule };
  }

  @Get('schedules')
  @ApiOperation({ summary: 'List schedules for a user' })
  @ApiResponse({ status: 200, description: 'Schedules retrieved' })
  async getSchedules(@Query() query: GetSchedulesQueryDto) {
    const schedules = await this.scheduler.getSchedules(query.userId);
    return { schedules, total: schedules.length };
  }
}
