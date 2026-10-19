import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// timestamps: true -> Mongoose adds createdAt / updatedAt automatically
@Schema({ timestamps: true })
export class User {
  // unique creates a MongoDB index: the database itself rejects duplicate emails
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  // select: false -> the hash is never returned by queries unless explicitly asked for
  @Prop({ required: true, select: false })
  password: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

// The only user shape that is ever sent to the client
export type PublicUser = { id: string; email: string; name: string };

export const toPublicUser = (user: UserDocument): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
});
