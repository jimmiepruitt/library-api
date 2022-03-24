import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BookModule } from '../../../book/book.module';
import { Model } from 'mongoose';
import { BookDocument } from '../../../schema/book.schema';
import { BookCopyDocument } from '../../../schema/book-copy.schema';
import { BookCopyModule } from '../../../book-copy/book-copy.module';
import { BookService } from '../../../book/book.service';

const book = {
  ISBN: '978-3-16-148410-9',
  name: 'The Book',
  author: 'Mark',
  description: 'Info',
  number: 10,
};

describe('BookCopyController', () => {
  let app: NestExpressApplication;
  let mongod;
  let BookModel: Model<BookDocument>;
  let BookCopyModel: Model<BookCopyDocument>;
  let bookService: BookService;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri, { dbName: 'test' }), // we use Mongoose here, but you can also use TypeORM
        BookModule,
        BookCopyModule,
      ],
    }).compile();

    BookModel = moduleRef.get(getModelToken('Book'));
    BookCopyModel = moduleRef.get(getModelToken('BookCopy'));
    bookService = moduleRef.get<BookService>(BookService);

    app = moduleRef.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  const uri = '/book-copies';

  describe('GET /book-copies', () => {
    it('Should return book copies data', async () => {
      await bookService.createBook(book);
      return request(app.getHttpServer())
        .get(uri)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(book.number);
          expect(res.body[0].bookId.name).toEqual(book.name);
        });
    });
  });

  afterEach(async () => {
    await BookModel.deleteMany({ ISBN: book.ISBN });
    await BookCopyModel.deleteMany();
  });

  afterAll(async () => {
    await mongod.stop();
    await app.close();
  });
});
