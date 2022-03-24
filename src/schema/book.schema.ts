import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema()
export class Book {
  @Prop({ index: true, unique: true })
  ISBN: string;

  @Prop()
  name: string;

  @Prop()
  author: string;

  @Prop()
  description?: string;

  @Prop()
  number?: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
