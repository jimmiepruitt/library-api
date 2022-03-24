import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiDefaultResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { BookService } from './book.service';
import { BookBodyCreation } from './dto/book.dto';

@Controller('books')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get()
  @ApiCreatedResponse({ description: 'Get list books' })
  public async getBooks() {
    return await this.bookService.getBooks();
  }

  @Post()
  @ApiCreatedResponse({ description: 'Create new Book' })
  @ApiBadRequestResponse({
    description: 'Return 400 in case body is incorrect',
  })
  public async createBook(@Body() body: BookBodyCreation) {
    try {
      await this.bookService.createBook(body);
    } catch (error) {
      if (error instanceof Error && error.message === 'Duplicate ISBN') {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Delete(':bookId')
  @ApiDefaultResponse({ description: 'Delete Book' })
  @ApiNotFoundResponse({
    description: 'Return 404 in case bookId not found',
  })
  public async deleteBook(@Param('bookId') bookId: string) {
    try {
      await this.bookService.deleteBook(bookId);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Not Found') {
          throw new NotFoundException(error.message);
        }
        if (error.message === 'Format bookId is invalid') {
          throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }
}
