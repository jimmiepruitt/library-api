import { Module } from '@nestjs/common';
import { BookCopyService } from './book-copy.service';
import { BookCopyController } from './book-copy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from '../schema/book.schema';
import { BookCopy, BookCopySchema } from '../schema/book-copy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookCopy.name, schema: BookCopySchema },
    ]),
  ],
  providers: [BookCopyService],
  controllers: [BookCopyController],
})
export class BookCopyModule {}
