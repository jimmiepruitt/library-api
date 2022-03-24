import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BookBodyCreation {
  @ApiProperty({ example: '978-3-16-148410-0' })
  @IsString()
  ISBN: string;

  @ApiProperty({ example: 'The Book' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Mark' })
  @IsString()
  author: string;

  @ApiPropertyOptional({ example: 'Info' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  number: number;
}
