import { IsNotEmpty, IsString } from 'class-validator';

export class AnalyzeProfileDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
