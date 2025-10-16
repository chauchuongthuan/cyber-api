import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { MultiLanguageProp, MultiLanguageSlugProp } from '@schemas/utils/multiLanguageProp';
import { StatusEnum } from '@core/constants/post.enum';
import { User } from '../user/user.schemas';
@Schema({
   timestamps: true,
   collection: 'posts',
})
export class Post extends Document {
   @Prop({
      required: true,
      trim: true,
   })
   title: string;

   @Prop({
      required: true,
      trim: true,
      unique: true,
   })
   slug: string;

   @Prop({
      required: true,
      trim: true,
   })
   content: string;

   @Prop({
      required: false,
      trim: true,
   })
   readTime: string;

   @Prop({
      required: false,
      trim: true,
   })
   author: string;

   @Prop({
      default: null,
   })
   image: string;

   // @Prop({
   //    required: false,
   //    default: null,
   // })
   // publishedAt: Date;

   @Prop({
      required: true,
      default: Date.now,
   })
   createdAt: Date;

   @Prop({
      required: true,
      default: Date.now,
   })
   updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods.thumbnail = function (field: string, type: string): object {
   return {
      collection: 'posts',
      method: 'inside',
      fields: {
         image: {},
      },
   };
};
