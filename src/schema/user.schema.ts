import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

type UserStatus = 'pending' | 'active' | 'inactive';

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ type: String })
  status: UserStatus;

  @Prop()
  description?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
