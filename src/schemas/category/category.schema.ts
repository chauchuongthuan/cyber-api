import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
@Schema({
   timestamps: true,
   collection: 'categories',
})
export class Category extends Document implements TimestampInterface {
   @Prop({
      required: true,
      trim: true,
   })
   name: string;

   @Prop({
      required: true,
      trim: true,
   })
   slug: string;

   @Prop({
      required: true,
      default: false,
   })
   unCategory: boolean;

   @Prop({
      required: true,
      default: 0,
   })
   sortOrder: number;

   @Prop({
      default: null,
   })
   deletedAt: Date;

   @Prop()
   createdAt: Date;

   @Prop()
   updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
