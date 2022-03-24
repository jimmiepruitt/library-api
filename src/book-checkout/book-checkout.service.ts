import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BookCopy, BookCopyDocument } from '../schema/book-copy.schema';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import * as moment from 'moment';
import { BookCheckout } from './dto/book-checkout.dto';
import { User, UserDocument } from '../schema/user.schema';
import { uniq } from 'lodash';
import { isMongoId } from 'class-validator';
@Injectable()
export class BookCheckoutService {
  constructor(
    @InjectModel(BookCopy.name) private bookCopyModel: Model<BookCopyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  public async checkoutBook({
    userId,
    bookCopyIds,
  }: BookCheckout): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('userId not found');
    }
    const bookCopies = await this.bookCopyModel
      .find({
        _id: { $in: bookCopyIds },
        status: 'notAvailable',
      })
      .populate('bookId');

    if (bookCopies.length > 0) {
      const names = uniq(bookCopies.map((i) => i.bookId.name)).join('/');
      throw new Error(`Book: ${names} in not available`);
    }

    const booksCheckout = await this.bookCopyModel.find({
      checkoutBy: new mongoose.Types.ObjectId(userId),
    });

    if (booksCheckout.length + bookCopyIds.length > 3) {
      throw new Error('User only can checked out total 3 books');
    }

    if (booksCheckout.length) {
      const overdueBooks = booksCheckout.find((item) =>
        moment(item.dueDate).isBefore(new Date()),
      );
      if (overdueBooks) {
        throw new Error('User have overdue date book');
      }
    }

    const booksWillCheckout = await this.bookCopyModel
      .find({
        _id: { $in: bookCopyIds },
      })
      .exec();
    if (booksWillCheckout.length !== bookCopyIds.length) {
      throw new Error('One of book is not exists');
    }

    await this.bookCopyModel.updateMany(
      {
        _id: { $in: bookCopyIds },
      },
      {
        checkoutBy: new mongoose.Types.ObjectId(userId),
        dueDate: moment().add(14, 'days'),
        status: 'notAvailable',
      },
    );
  }

  public async returnBook({
    userId,
    bookCopyIds,
  }: BookCheckout): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('userId not found');
    }

    const booksNotBelongUser = await this.bookCopyModel
      .find({
        _id: { $in: bookCopyIds },
        checkoutBy: { $ne: new mongoose.Types.ObjectId(userId) },
      })
      .populate('bookId');

    if (booksNotBelongUser.length) {
      throw new Error(
        `Books ${uniq(booksNotBelongUser.map((i) => i.bookId.name)).join(
          '/',
        )} is not belong this user`,
      );
    }

    await this.bookCopyModel.updateMany(
      {
        _id: { $in: bookCopyIds },
        checkoutBy: new mongoose.Types.ObjectId(userId),
        status: 'notAvailable',
      },
      {
        $unset: { checkoutBy: 1, dueDate: 1 },
        status: 'available',
      },
    );
  }

  public async getAllCheckout(): Promise<BookCopyDocument[]> {
    return await this.bookCopyModel
      .find({ status: 'notAvailable' })
      .populate('checkoutBy')
      .populate('bookId');
  }

  public async getBookCheckedOutByUser(
    userId: string,
  ): Promise<BookCopyDocument[]> {
    if (!isMongoId(userId)) {
      throw new Error('userId format is not correct');
    }
    return await this.bookCopyModel
      .find({ checkoutBy: new mongoose.Types.ObjectId(userId) })
      .populate('checkoutBy')
      .populate('bookId');
  }

  getOverdueBookCopies() {
    return this.bookCopyModel
      .find({
        dueDate: {
          $lt: moment(),
        },
      })
      .populate('bookId')
      .populate('checkoutBy');
  }
}
