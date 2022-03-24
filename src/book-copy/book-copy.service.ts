import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BookCopy, BookCopyDocument } from '../schema/book-copy.schema';
import { Model } from 'mongoose';
import * as moment from 'moment';

@Injectable()
export class BookCopyService {
  constructor(
    @InjectModel(BookCopy.name) private bookCopyModel: Model<BookCopyDocument>,
  ) {}

  getBookCopies() {
    return this.bookCopyModel.find({}).populate({ path: 'bookId' });
  }
}
