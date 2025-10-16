import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MultiLanguageContentProp, MultiLanguageProp } from '../utils/multiLanguageProp';

@Schema({
   timestamps: true,
   collection: 'pages',
})
export class Page extends Document {
   @Prop({
      required: true,
      trim: true,
      unique: true,
   })
   code: string;

   @Prop(MultiLanguageProp)
   name: object;

   @Prop(MultiLanguageContentProp)
   content: object;

   @Prop(MultiLanguageProp)
   metaTitle: object;

   @Prop(MultiLanguageProp)
   metaImage: object;

   @Prop(MultiLanguageProp)
   metaDescription: object;

   @Prop(MultiLanguageProp)
   metaKeyword: object;

   @Prop()
   createdAt: Date;

   @Prop()
   updatedAt: Date;
}

export const PageSchema = SchemaFactory.createForClass(Page);

PageSchema.methods.thumbnail = function (): any {
   return {
      collection: 'pages',
      method: 'inside',
      fields: {
         bannerImg: {},
         bannerImgMb: {},
      },
      fieldTrans: {
         metaImage: {
            FB: '600x314',
         },
      },
   };
};

PageSchema.methods.fieldTranslations = function (): any {
   return {
      name: true,
      content: false,
      metaImage: false,
      metaDescription: false,
      metaKeyword: false,
   };
};
