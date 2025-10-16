import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentStatusEnum } from '@src/core/constants/payment.enum';
import { Document, SchemaTypes } from 'mongoose';
import { Customer } from '../customer/customer.schemas';
@Schema({
   timestamps: true,
   collection: 'payments',
})
export class Payment extends Document implements TimestampInterface {
   @Prop({
      index: true,
      type: SchemaTypes.ObjectId,
      ref: Customer.name,
   })
   customer: any;

   @Prop({
      required: true,
      type: Number,
   })
   usd: number;

   @Prop({
      required: false,
      type: String,
   })
   paymentId: string;

   @Prop({
      required: false,
      type: String,
   })
   key: string;

   @Prop({
      required: true,
      type: Number,
   })
   type: number;

   @Prop({
      required: true,
      type: String,
   })
   coin: string;

   @Prop({
      required: true,
      type: Number,
      default: PaymentStatusEnum.UNPAID,
   })
   status: number;

   @Prop({
      default: null,
   })
   deletedFeAt: Date;

   @Prop({
      default: null,
   })
   deletedAt: Date;

   @Prop()
   createdAt: Date;

   @Prop()
   updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// PaymentSchema.methods.thumbnail = function (field: string, type: string): object {
//    return {
//       collection: 'payments',
//       method: 'inside',
//       fields: {
//          image: {},
//       },
//    };
// };
