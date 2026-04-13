import { IsNotEmpty, IsString } from 'class-validator';

export class IngestTextDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;
}
