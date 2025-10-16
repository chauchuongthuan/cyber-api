import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({
   timestamps: true,

   collection: 'tokenDraw',
})
export class TokenDraw extends Document implements TimestampInterface, TimestampInterface {
   @Prop({
      required: true,
      trim: true,
   })
   name: string;

   @Prop({
      trim: true,
      default: null,
   })
   nameNon: string;

   @Prop({
      required: true,
      unique: true,
   })
   token: string;

   @Prop({
      required: true,
      default: true,
   })
   active: boolean;

   @Prop({
      required: false,
      default: false,
   })
   isWin: boolean;

   @Prop({
      default: null,
   })
   winDate: Date;

   @Prop()
   createdAt: Date;

   @Prop()
   updatedAt: Date;

   @Prop({
      default: null,
   })
   deletedAt: Date;
}

export const TokenDrawSchema = SchemaFactory.createForClass(TokenDraw);
