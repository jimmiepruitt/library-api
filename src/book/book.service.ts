import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from '../schema/book.schema';
import { Model } from 'mongoose';
import { BookBodyCreation } from './dto/book.dto';
import { BookCopy, BookCopyDocument } from '../schema/book-copy.schema';
import mongoose from 'mongoose';
import { isMongoId } from 'class-validator';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(BookCopy.name) private bookCopyModel: Model<BookCopyDocument>,
  ) {}

  public async createBookCopies(
    numberOfBook: number,
    book: BookDocument,
  ): Promise<void> {
    const bookCopies = [];
    for (let i = 0; i < numberOfBook; i++) {
      const bookCopy = {
        bookId: book._id,
        status: 'available',
      };
      bookCopies.push(bookCopy);
    }
    await this.bookCopyModel.insertMany(bookCopies);
  }

  public async createBook(book: BookBodyCreation): Promise<void> {
    try {
      const bookDoc = new this.bookModel(book);
      await bookDoc.save();
      this.createBookCopies(book.number, bookDoc);
    } catch (error) {
      if (error.code && error.code === 11000) {
        throw new Error('Duplicate ISBN');
      }
    }
  }

  public async getBooks(): Promise<BookDocument[]> {
    const bookDocs = this.bookModel.find({});
    return bookDocs;
  }

  public async deleteBook(bookId: string): Promise<void> {
    if (!isMongoId(bookId)) {
      throw new Error('Format bookId is invalid');
    }
    const bookObjectId = new mongoose.Types.ObjectId(bookId);

    const bookDoc = await this.bookModel.findById(bookId);
    if (!bookDoc) {
      throw new Error('Not Found');
    }

    await Promise.all([
      this.bookModel.deleteOne({
        _id: bookObjectId,
      }),
      this.bookCopyModel.deleteMany({ bookId: bookObjectId }),
    ]);
  }
}
