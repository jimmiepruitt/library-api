import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { BookDocument } from '../../../schema/book.schema';
import { BookCopyDocument } from '../../../schema/book-copy.schema';
import { BookCheckoutModule } from '../../book-checkout.module';
import { BookModule } from '../../../book/book.module';
import { BookService } from '../../../book/book.service';
import { UserDocument } from '../../../schema/user.schema';
import { UserModule } from '../../../user/user.module';
import mongoose from 'mongoose';
import { BookCheckoutService } from '../../book-checkout.service';
import * as moment from 'moment';
import { BookBodyCreation } from 'src/book/dto/book.dto';

const book = {
  ISBN: '978-3-16-148410-1',
  name: 'The Book',
  author: 'Mark',
  description: 'Info',
  number: 10,
};
const dummyUser = {
  firstName: 'string',
  lastName: 'string',
  status: 'active',
  description: 'string',
};
let userId: string;

describe('BookCheckoutController', () => {
  let app: NestExpressApplication;
  let mongod;
  let bookService: BookService;
  let bookCheckoutService: BookCheckoutService;

  let BookModel: Model<BookDocument>;
  let BookCopyModel: Model<BookCopyDocument>;
  let UserModel: Model<UserDocument>;

  const createBook = async (book: BookBodyCreation, ISBN: string) => {
    await bookService.createBook(book);
    const bookDoc = await BookModel.findOne({ ISBN });
    return BookCopyModel.find({ bookId: bookDoc.id }).lean().exec();
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri, { dbName: 'test' }),
        BookCheckoutModule,
        BookModule,
        UserModule,
      ],
    }).compile();

    BookModel = moduleRef.get(getModelToken('Book'));
    BookCopyModel = moduleRef.get(getModelToken('BookCopy'));
    UserModel = moduleRef.get(getModelToken('User'));
    bookService = moduleRef.get<BookService>(BookService);
    bookCheckoutService =
      moduleRef.get<BookCheckoutService>(BookCheckoutService);

    app = moduleRef.createNestApplication<NestExpressApplication>();
    await app.init();

    const userDoc = new UserModel(dummyUser);
    await userDoc.save();
    userId = userDoc.id;
  });

  describe('POST /book-checkout', () => {
    beforeEach(async () => {
      await BookCopyModel.updateMany(
        {
          checkoutBy: new mongoose.Types.ObjectId(userId),
        },
        {
          $unset: { checkoutBy: 1, dueDate: 1 },
          status: 'available',
        },
      );
    });
    const uri = '/book-checkout';
    it('Should checked out books with status code 201', async () => {
      await bookService.createBook(book);
      const bookDoc = await BookModel.findOne({ ISBN: book.ISBN });
      const bookCopies = await BookCopyModel.find({ bookId: bookDoc.id })
        .lean()
        .exec();
      const bookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      return request(app.getHttpServer())
        .post(uri)
        .send(reqBody)
        .expect(201)
        .expect(async () => {
          const bookCopiesDoc = await BookCopyModel.find({
            checkoutBy: new mongoose.Types.ObjectId(userId),
          });
          expect(bookCopiesDoc).toHaveLength(3);
        });
    });

    it('Should return 422 when bookCopyId not found', async () => {
      const reqBody = {
        bookCopyIds: [new mongoose.Types.ObjectId()],
        userId,
      };
      return request(app.getHttpServer())
        .post(uri)
        .send(reqBody)
        .expect(422)
        .expect(async (res) => {
          expect(res.body).toEqual({
            error: 'Unprocessable Entity',
            message: 'One of book is not exists',
            statusCode: 422,
          });
        });
    });

    it('Should return 422 when user check out more than 3 books', async () => {
      const ISBN = '_ISBN';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);
      const bookCopyIds = bookCopies.splice(0, 4).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      return request(app.getHttpServer())
        .post(uri)
        .send(reqBody)
        .expect(422)
        .expect(async (res) => {
          expect(res.body).toEqual({
            error: 'Unprocessable Entity',
            message: 'User only can checked out total 3 books',
            statusCode: 422,
          });
        });
    });

    it('Should return 422 when user check out total (checked out and will check out) more than 3 books', async () => {
      const ISBN = '_ISBN_NEW';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);
      const bookCopyIds = bookCopies.splice(0, 2).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      const bookCopiesCheckedOut = bookCopies
        .splice(0, 2)
        .map((i) => String(i._id));
      await bookCheckoutService.checkoutBook({
        userId,
        bookCopyIds: bookCopiesCheckedOut,
      });
      return request(app.getHttpServer())
        .post(uri)
        .send(reqBody)
        .expect(422)
        .expect(async (res) => {
          expect(res.body).toEqual({
            error: 'Unprocessable Entity',
            message: 'User only can checked out total 3 books',
            statusCode: 422,
          });
        });
    });

    it('Should return 422 when user have overdue book', async () => {
      const ISBN = '_ISBN_OVERDUE_WHEN_CHECKOUT_USER';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);
      const bookCopyIds = bookCopies.splice(0, 1).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };

      const bookCopiesCheckedOut = bookCopies
        .splice(0, 2)
        .map((i) => String(i._id));
      await bookCheckoutService.checkoutBook({
        userId,
        bookCopyIds: bookCopiesCheckedOut,
      });

      const overDueBookId = bookCopiesCheckedOut[0];
      await BookCopyModel.updateOne(
        { _id: new mongoose.Types.ObjectId(overDueBookId) },
        {
          dueDate: moment().subtract('2', 'days'),
        },
      );

      return request(app.getHttpServer())
        .post(uri)
        .send(reqBody)
        .expect(422)
        .expect(async (res) => {
          expect(res.body).toEqual({
            error: 'Unprocessable Entity',
            message: 'User have overdue date book',
            statusCode: 422,
          });
        });
    });
  });

  describe('DELETE /book-checkout', () => {
    beforeEach(async () => {
      await BookCopyModel.updateMany(
        {
          checkoutBy: new mongoose.Types.ObjectId(userId),
        },
        {
          $unset: { checkoutBy: 1, dueDate: 1 },
          status: 'available',
        },
      );
    });
    const uri = '/book-checkout';
    it('Should return books success with status code 200', async () => {
      const ISBN = '_ISBN_RETURN';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);
      const bookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      await bookCheckoutService.checkoutBook(reqBody);
      return request(app.getHttpServer())
        .delete(uri)
        .send(reqBody)
        .expect(200)
        .expect(async () => {
          const bookCopiesDoc = await BookCopyModel.find({
            checkoutBy: new mongoose.Types.ObjectId(userId),
          });
          expect(bookCopiesDoc).toHaveLength(0);
        });
    });
    it('Should return 422 when book is not yet checked out', async () => {
      const ISBN = '_ISBN_RETURN_FAIL';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);
      const bookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      return request(app.getHttpServer())
        .delete(uri)
        .send(reqBody)
        .expect(422)
        .expect(async (res) => {
          expect(res.body).toEqual({
            error: 'Unprocessable Entity',
            message: 'Books The Book is not belong this user',
            statusCode: 422,
          });
        });
    });
  });

  describe('GET /book-checkout', () => {
    const uri = '/book-checkout';
    beforeEach(async () => {
      await BookCopyModel.updateMany(
        {
          checkoutBy: new mongoose.Types.ObjectId(userId),
        },
        {
          $unset: { checkoutBy: 1, dueDate: 1 },
          status: 'available',
        },
      );
    });
    it('Should return all books is checked out', async () => {
      const ISBN = '_ISBN_CHECKOUT';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);

      const bookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      await bookCheckoutService.checkoutBook(reqBody);

      const userDoc = new UserModel({ ...dummyUser, firstName: 'test2' });
      await userDoc.save();
      const newUserId = String(userDoc._id);
      const newBookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      await bookCheckoutService.checkoutBook({
        bookCopyIds: newBookCopyIds,
        userId: newUserId,
      });

      return request(app.getHttpServer())
        .get(uri)
        .expect(200)
        .expect(async (res) => {
          expect(res.body).toHaveLength(6);
        });
    });
  });

  describe('GET /book-checkout/:userId', () => {
    const uri = '/book-checkout';
    beforeEach(async () => {
      await BookCopyModel.updateMany(
        {
          checkoutBy: new mongoose.Types.ObjectId(userId),
        },
        {
          $unset: { checkoutBy: 1, dueDate: 1 },
          status: 'available',
        },
      );
    });
    it('Should return all books is checked out by user', async () => {
      const ISBN = '_ISBN_CHECKOUT_BY_USER';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);
      const bookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      await bookCheckoutService.checkoutBook(reqBody);
      return request(app.getHttpServer())
        .get(`${uri}/${userId}`)
        .expect(200)
        .expect(async (res) => {
          expect(res.body).toHaveLength(3);
        });
    });
    it('Should return 404 not found when user does not have checked out book', async () => {
      return request(app.getHttpServer())
        .get(`${uri}/${userId}`)
        .expect(404)
        .expect(async (res) => {
          expect(res.body).toEqual({ message: 'Not Found', statusCode: 404 });
        });
    });
  });

  describe('GET /book-checkout/overdue', () => {
    const uri = '/book-checkout/overdue';
    beforeEach(async () => {
      await BookCopyModel.updateMany(
        {
          checkoutBy: new mongoose.Types.ObjectId(userId),
        },
        {
          $unset: { checkoutBy: 1, dueDate: 1 },
          status: 'available',
        },
      );
    });
    it('Should return all books is checked out', async () => {
      const ISBN = '_ISBN_OVERDUE';
      const newBook = {
        ...book,
        ISBN,
      };

      const bookCopies = await createBook(newBook, ISBN);

      const bookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      const reqBody = {
        bookCopyIds,
        userId,
      };
      await bookCheckoutService.checkoutBook(reqBody);

      const userDoc = new UserModel({ ...dummyUser, firstName: 'test2' });
      await userDoc.save();
      const newUserId = String(userDoc._id);
      const newBookCopyIds = bookCopies.splice(0, 3).map((i) => String(i._id));
      await bookCheckoutService.checkoutBook({
        bookCopyIds: newBookCopyIds,
        userId: newUserId,
      });

      const overDueBookIds = [bookCopyIds[0], newBookCopyIds[0]];
      await BookCopyModel.updateMany(
        { _id: { $in: overDueBookIds } },
        {
          dueDate: moment().subtract('2', 'days'),
        },
      );

      return request(app.getHttpServer())
        .get(uri)
        .expect(200)
        .expect(async (res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body.map((i) => i._id)).toEqual(
            expect.arrayContaining(overDueBookIds),
          );
        });
    });
  });

  afterAll(async () => {
    await mongod.stop();
    await app.close();
  });
});
