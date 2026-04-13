import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TemplatesService } from './services/templates.service';
import { Template } from '../../common/interfaces';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all content templates' })
  @ApiResponse({ status: 200, description: 'Array of content templates' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  getTemplates(@Query('category') category?: string): Template[] {
    return this.templatesService.getTemplates(category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all template categories' })
  @ApiResponse({ status: 200, description: 'Array of category names' })
  getCategories(): string[] {
    return this.templatesService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific template by ID' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  getTemplate(@Param('id') id: string): Template {
    return this.templatesService.getTemplateById(id);
  }
}
