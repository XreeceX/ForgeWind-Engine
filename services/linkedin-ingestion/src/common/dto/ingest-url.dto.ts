import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class IngestUrlDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/, {
    message: 'Must be a valid LinkedIn profile URL (https://linkedin.com/in/username)',
  })
  profileUrl!: string;
}
