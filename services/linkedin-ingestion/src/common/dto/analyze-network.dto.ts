import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ConnectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  connectedDate!: string;
}

export class AnalyzeNetworkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectionDto)
  connections!: ConnectionDto[];
}
