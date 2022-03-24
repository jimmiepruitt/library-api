import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserBodyCreation {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  description?: string;
}
