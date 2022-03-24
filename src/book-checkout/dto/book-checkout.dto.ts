import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsString } from 'class-validator';

export class BookCheckout {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  bookCopyIds: string[];

  @ApiProperty()
  @IsMongoId()
  userId: string;
}
