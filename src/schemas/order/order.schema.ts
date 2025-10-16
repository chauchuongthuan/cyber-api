import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Customer } from '../customer/customer.schemas';
import { Product } from '../product/product.schema';
@Schema({
   timestamps: true,
   collection: 'orders',
})
export class Order extends Document implements TimestampInterface {
   @Prop({
      index: true,
      type: SchemaTypes.ObjectId,
      ref: Product.name,
   })
   product: any;

   @Prop({
      index: true,
      type: SchemaTypes.ObjectId,
      ref: Customer.name,
   })
   customer: any;

   @Prop({
      required: true,
   })
   quantity: number;

   @Prop({
      required: true,
   })
   price: number;

   @Prop({
      default: null,
   })
   deletedAt: Date;

   @Prop()
   createdAt: Date;

   @Prop()
   updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// OrderSchema.methods.thumbnail = function (field: string, type: string): object {
//    return {
//       collection: 'orders',
//       method: 'inside',
//       fields: {
//          image: {},
//       },
//    };
// };
