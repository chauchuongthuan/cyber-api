import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Category } from '../category/category.schema';
@Schema({
   timestamps: true,
   collection: 'products',
})
export class Product extends Document implements TimestampInterface {
   @Prop({
      required: true,
      trim: true,
   })
   name: string;

   @Prop({
      required: false,
      trim: true,
   })
   title: string;
   @Prop({
      required: false,
      trim: true,
   })
   info: string;
   @Prop({
      required: false,
      trim: true,
   })
   subname: string;

   @Prop({
      required: false,
      trim: true,
   })
   description: string;

   @Prop({
      required: false,
      type: Object,
   })
   page: any;

   @Prop({
      default: null,
   })
   image: string;

   @Prop({
      default: null,
   })
   rating: string;

   @Prop({
      default: false,
   })
   verified: boolean;

   @Prop({
      default: null,
   })
   country: string;

   @Prop({
      default: null,
   })
   countryName: string;

   @Prop({
      required: true,
      trim: true,
      unique: true,
   })
   slug: string;

   // @Prop({
   //    required: true,
   // })
   // price: number;

   // @Prop({
   //    required: true,
   // })
   // quantity: number;

   @Prop({
      index: true,
      type: SchemaTypes.ObjectId,
      ref: Category.name,
   })
   category: any;

   @Prop({
      required: false,
      type: Array<string>,
   })
   content: Array<string>;

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

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.methods.thumbnail = function (field: string, type: string): object {
   return {
      collection: 'posts',
      method: 'inside',
      fields: {
         image: {},
      },
   };
};

