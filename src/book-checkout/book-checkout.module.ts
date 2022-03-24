import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookCopy, BookCopySchema } from '../schema/book-copy.schema';
import { Book, BookSchema } from '../schema/book.schema';
import { User, UserSchema } from '../schema/user.schema';
import { BookCheckoutController } from './book-checkout.controller';
import { BookCheckoutService } from './book-checkout.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookCopy.name, schema: BookCopySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BookCheckoutController],
  providers: [BookCheckoutService],
})
export class BookCheckoutModule {}
