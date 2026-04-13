import { IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PostDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsInt()
  @Min(0)
  likes!: number;

  @IsInt()
  @Min(0)
  comments!: number;

  @IsInt()
  @Min(0)
  shares!: number;

  @IsEnum(['text', 'image', 'video', 'article'] as const)
  mediaType!: 'text' | 'image' | 'video' | 'article';
}

export class AnalyzeActivityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostDto)
  posts!: PostDto[];
}
