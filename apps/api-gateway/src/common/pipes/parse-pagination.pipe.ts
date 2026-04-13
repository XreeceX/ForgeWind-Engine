import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ParsePaginationPipe
  implements PipeTransform<{ page?: string; limit?: string }, PaginationParams>
{
  transform(value: { page?: string; limit?: string }): PaginationParams {
    const page = this.parsePositiveInt(value.page, DEFAULT_PAGE, 'page');
    const limit = this.parsePositiveInt(value.limit, DEFAULT_LIMIT, 'limit');

    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(
        `limit must not exceed ${MAX_PAGE_SIZE}`,
      );
    }

    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
  }

  private parsePositiveInt(
    raw: string | undefined,
    fallback: number,
    field: string,
  ): number {
    if (raw === undefined || raw === '') return fallback;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${field} must be a positive integer`);
    }
    return parsed;
  }
}
