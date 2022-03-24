import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { BookCopyModule } from './book-copy/book-copy.module';
import { BookCheckoutModule } from './book-checkout/book-checkout.module';
import { UserModule } from './user/user.module';
import 'dotenv/config';
@Module({
  imports: [
    BookModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    BookCopyModule,
    BookCheckoutModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
