import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Customer } from '../customer/customer.schemas';
@Schema({
   timestamps: true,
   collection: 'subscribers',
})
export class Subscriber extends Document implements TimestampInterface {
   // @Prop({
   //    required: true,
   //    trim: true,
   // })
   // name: string;

   // @Prop({
   //    required: true,
   //    trim: true,
   // })
   // email: string;

   @Prop({
      required: true,
      trim: true,
   })
   taskType: string;

   @Prop({
      required: false,
   })
   priority: string;

   @Prop({
      required: true,
   })
   subject: string;

   @Prop({
      index: true,
      type: SchemaTypes.ObjectId,
      ref: Customer.name,
   })
   customer: any;

   @Prop({
      required: false,
      trim: true,
   })
   message: string;

   @Prop({
      default: null,
   })
   deletedAt: Date;

   @Prop()
   createdAt: Date;

   @Prop()
   updatedAt: Date;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
