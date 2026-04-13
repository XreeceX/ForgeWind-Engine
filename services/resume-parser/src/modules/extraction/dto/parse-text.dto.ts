import { IsNotEmpty, IsString } from 'class-validator';

export class ParseTextDto {
  @IsString()
  @IsNotEmpty({ message: 'Resume text must not be empty' })
  text!: string;
}
