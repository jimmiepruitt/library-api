import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BookModule } from '../../book.module';
import { Model } from 'mongoose';
import { BookDocument } from '../../../schema/book.schema';
import { BookCopyDocument } from '../../../schema/book-copy.schema';

const book = {
  ISBN: '978-3-16-148410-0',
  name: 'The Book',
  author: 'Mark',
  description: 'Info',
  number: 10,
};

describe('BookController', () => {
  let app: NestExpressApplication;
  let mongod;
  let BookModel: Model<BookDocument>;
  let BookCopyModel: Model<BookCopyDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri, { dbName: 'test' }), // we use Mongoose here, but you can also use TypeORM
        BookModule,
      ],
    }).compile();

    BookModel = moduleRef.get(getModelToken('Book'));
    BookCopyModel = moduleRef.get(getModelToken('BookCopy'));

    app = moduleRef.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  const uri = '/books';

  describe('GET /books', () => {
    it('Should return books data', async () => {
      const ISBN = '_ISBN_A';
      const requestBody = {
        ...book,
        ISBN,
      };
      const bookDoc = new BookModel(requestBody);
      await bookDoc.save();
      return request(app.getHttpServer())
        .get(uri)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([expect.objectContaining(requestBody)]);
        });
    });
  });

  describe('POST /books', () => {
    it('Should create a book success', async () => {
      const ISBN = '_ISBN_B';
      const requestBody = {
        ...book,
        ISBN,
      };
      return request(app.getHttpServer())
        .post(uri)
        .send(requestBody)
        .expect(201)
        .expect(async () => {
          const bookDoc = await BookModel.findOne({ ISBN: ISBN }).exec();
          expect(bookDoc.toObject()).toEqual(
            expect.objectContaining(requestBody),
          );
          const bookCopies = await BookCopyModel.find({}).exec();
          expect(bookCopies).toHaveLength(book.number);
        });
    });

    it('Should return 400 when ISBN already existed', async () => {
      const ISBN = '_ISBN_400';
      const requestBody = {
        ...book,
        ISBN,
      };
      const bookDoc = new BookModel(requestBody);
      await bookDoc.save();
      return request(app.getHttpServer())
        .post(uri)
        .send(requestBody)
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ message: 'Duplicate ISBN' }),
          );
        });
    });
  });

  describe('DELETE /books', () => {
    it('Should return books data', async () => {
      const ISBN = '_ISBN_DELETE';
      const requestBody = {
        ...book,
        ISBN,
      };
      const bookDoc = new BookModel(requestBody);
      await bookDoc.save();
      return request(app.getHttpServer())
        .delete(`${uri}/${bookDoc.id}`)
        .expect(200)
        .expect(async () => {
          const bookInfo = await BookModel.findById(bookDoc.id);
          expect(bookInfo).toBeNull();
        });
    });
  });

  afterAll(async () => {
    await mongod.stop();
    await app.close();
  });
});
