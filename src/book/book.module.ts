import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookCopy, BookCopySchema } from '../schema/book-copy.schema';
import { Book, BookSchema } from '../schema/book.schema';
import { BookController } from './book.controller';
import { BookService } from './book.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookCopy.name, schema: BookCopySchema },
    ]),
  ],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
