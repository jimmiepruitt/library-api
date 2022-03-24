import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookCheckoutService } from './book-checkout.service';
import { BookCheckout } from './dto/book-checkout.dto';

@Controller('book-checkout')
@ApiTags('book-checkout')
export class BookCheckoutController {
  constructor(private bookCheckoutService: BookCheckoutService) {}

  @Post()
  public async checkout(@Body() body: BookCheckout) {
    try {
      await this.bookCheckoutService.checkoutBook(body);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message == 'userId not found') {
          throw new NotFoundException(error.message);
        } else {
          throw new UnprocessableEntityException(error.message);
        }
      }
      throw error;
    }
  }

  @Delete()
  public async returnBook(@Body() body: BookCheckout) {
    try {
      await this.bookCheckoutService.returnBook(body);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message == 'userId not found') {
          throw new NotFoundException(error.message);
        } else {
          throw new UnprocessableEntityException(error.message);
        }
      }
      throw error;
    }
  }

  @Get()
  public async getAllCheckout() {
    return await this.bookCheckoutService.getAllCheckout();
  }

  @Get('/overdue')
  public async getOverdueBookCopies() {
    return this.bookCheckoutService.getOverdueBookCopies();
  }

  @Get(':userId')
  public async getBookCheckedOutByUser(@Param('userId') userId: string) {
    try {
      const result = await this.bookCheckoutService.getBookCheckedOutByUser(
        userId,
      );
      if (result.length === 0) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message == 'userId format is not correct') {
          throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }
}
