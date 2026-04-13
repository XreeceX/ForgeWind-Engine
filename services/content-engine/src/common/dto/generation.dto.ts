import {
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum PostToneEnum {
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  THOUGHT_LEADERSHIP = 'thought-leadership',
  STORYTELLING = 'storytelling',
}

enum PostLengthEnum {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

enum EmailToneEnum {
  FORMAL = 'formal',
  FRIENDLY = 'friendly',
  BOLD = 'bold',
}

class UserContextDto {
  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  industry!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(200)
  role!: string;

  @ApiProperty({ example: ['TypeScript', 'System Design', 'Cloud Architecture'] })
  @IsArray()
  @IsString({ each: true })
  expertise!: string[];
}

export class GeneratePostDto {
  @ApiProperty({ example: 'Why microservices are not always the answer' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  topic!: string;

  @ApiProperty({ enum: PostToneEnum, example: 'thought-leadership' })
  @IsEnum(PostToneEnum)
  tone!: PostToneEnum;

  @ApiProperty({ enum: PostLengthEnum, example: 'medium' })
  @IsEnum(PostLengthEnum)
  length!: PostLengthEnum;

  @ApiProperty({ example: true })
  @IsBoolean()
  includeHashtags!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  includeEmoji!: boolean;

  @ApiProperty({ type: UserContextDto })
  @ValidateNested()
  @Type(() => UserContextDto)
  userContext!: UserContextDto;
}

export class GenerateHeadlineDto {
  @ApiProperty({ example: 'Software Engineer at FAANG' })
  @IsString()
  @MaxLength(500)
  currentHeadline!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(200)
  role!: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  industry!: string;

  @ApiProperty({ example: ['TypeScript', 'React', 'Node.js'] })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiProperty({ example: 'Building scalable web applications that serve millions' })
  @IsString()
  @MaxLength(500)
  valueProposition!: string;
}

export class GenerateAboutDto {
  @ApiProperty({ example: 'I am a software engineer with 5 years of experience...' })
  @IsString()
  @MaxLength(5000)
  currentAbout!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(200)
  role!: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  industry!: string;

  @ApiProperty({ example: ['Led team of 8 engineers', '5 years in cloud computing'] })
  @IsArray()
  @IsString({ each: true })
  experience!: string[];

  @ApiProperty({ example: ['TypeScript', 'AWS', 'System Design'] })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiProperty({ example: ['Reduced deploy time by 60%', 'Scaled system to 1M users'] })
  @IsArray()
  @IsString({ each: true })
  achievements!: string[];

  @ApiProperty({ example: 'Hiring managers and recruiters in tech' })
  @IsString()
  @MaxLength(500)
  targetAudience!: string;
}

export class RewriteExperienceDto {
  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @MaxLength(200)
  jobTitle!: string;

  @ApiProperty({ example: 'Google' })
  @IsString()
  @MaxLength(200)
  company!: string;

  @ApiProperty({
    example: [
      'Worked on backend services',
      'Helped improve system performance',
      'Collaborated with team members',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  originalBullets!: string[];

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  industry!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  targetRole?: string;
}

export class GenerateColdEmailDto {
  @ApiProperty({ example: 'Alex Johnson' })
  @IsString()
  @MaxLength(200)
  senderName!: string;

  @ApiProperty({ example: 'Senior Developer' })
  @IsString()
  @MaxLength(200)
  senderRole!: string;

  @ApiProperty({ example: 'Sarah Chen' })
  @IsString()
  @MaxLength(200)
  recipientName!: string;

  @ApiProperty({ example: 'VP of Engineering' })
  @IsString()
  @MaxLength(200)
  recipientRole!: string;

  @ApiProperty({ example: 'Stripe' })
  @IsString()
  @MaxLength(200)
  recipientCompany!: string;

  @ApiProperty({ example: 'Exploring senior engineering opportunities' })
  @IsString()
  @MaxLength(1000)
  purpose!: string;

  @ApiProperty({ example: ['Both spoke at ReactConf 2024', 'Mutual connection: John Doe'] })
  @IsArray()
  @IsString({ each: true })
  commonGround!: string[];

  @ApiProperty({ enum: EmailToneEnum, example: 'friendly' })
  @IsEnum(EmailToneEnum)
  tone!: EmailToneEnum;
}

export class RewriteTextDto {
  @ApiProperty({ example: 'We did stuff and things happened and it was good.' })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  originalText!: string;

  @ApiProperty({ example: 'professional' })
  @IsString()
  @MaxLength(100)
  targetTone!: string;

  @ApiProperty({ example: 'LinkedIn post about leadership' })
  @IsString()
  @MaxLength(500)
  purpose!: string;
}
