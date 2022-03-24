import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { UserDocument } from '../../../schema/user.schema';
import { UserModule } from '../../../user/user.module';

const dummyUser = {
  firstName: 'string',
  lastName: 'string',
  status: 'active',
  description: 'string',
};
describe('UserController', () => {
  let app: NestExpressApplication;
  let mongod;
  let UserModel: Model<UserDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri, { dbName: 'test' }), // we use Mongoose here, but you can also use TypeORM
        UserModule,
      ],
    }).compile();

    UserModel = moduleRef.get(getModelToken('User'));

    app = moduleRef.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  const uri = '/users';

  beforeEach(async () => {
    await UserModel.deleteMany();
  });

  describe('POST /users', () => {
    it('Should return book copies data', async () => {
      return request(app.getHttpServer()).post(uri).send(dummyUser).expect(201);
    });
  });

  describe('GET /users', () => {
    it('Should return book copies data', async () => {
      const user = new UserModel(dummyUser);
      await user.save();
      return request(app.getHttpServer())
        .get(uri)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([expect.objectContaining(dummyUser)]);
        });
    });
  });

  afterAll(async () => {
    await mongod.stop();
    await app.close();
  });
});
