import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Model } from 'mongoose';
import { UserBodyCreation } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async createUser(body: UserBodyCreation): Promise<void> {
    const userDoc = new this.userModel({ ...body, status: 'active' });
    await userDoc.save();
  }

  public async getUsers() {
    return this.userModel.find({});
  }
}
