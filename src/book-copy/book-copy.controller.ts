import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookCopyService } from './book-copy.service';

@Controller('book-copies')
@ApiTags('book-copies')
export class BookCopyController {
  constructor(private bookCopyService: BookCopyService) {}

  @Get()
  public async getBookCopies() {
    return this.bookCopyService.getBookCopies();
  }
}
