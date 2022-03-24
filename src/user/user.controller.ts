import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserDocument } from '../schema/user.schema';
import { UserBodyCreation } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  public async createUser(@Body() body: UserBodyCreation): Promise<void> {
    await this.userService.createUser(body);
  }

  @Get()
  public async getUsers(): Promise<UserDocument[]> {
    return await this.userService.getUsers();
  }
}
