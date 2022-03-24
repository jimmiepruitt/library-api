import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Book } from './book.schema';
import { User } from './user.schema';

export type BookCopyDocument = BookCopy & Document;

export type BookCopyStatus = 'available' | 'notAvailable';

@Schema()
export class BookCopy {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: Book.name, index: true })
  bookId: Book;

  @Prop({ type: String })
  status: BookCopyStatus;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: User.name, index: true })
  checkoutBy?: User;

  @Prop()
  description?: string;

  @Prop({ type: Date })
  dueDate?: Date;
}

export const BookCopySchema = SchemaFactory.createForClass(BookCopy);
