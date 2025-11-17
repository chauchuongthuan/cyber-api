import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DateTime } from '@core/constants/dateTime.enum';
import { saveFileContent } from '@src/core/helpers/content';
const moment = require('moment');

@Injectable({ scope: Scope.REQUEST })
export class TransformerProductService {
   private locale;

   constructor(
      @Inject(REQUEST) private request: any, // private readonly transformerRole: TransformerRoleService,
   ) {
      this.locale = this.request.locale;
   }

   async transformProductList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
      const self = this;
      if (docs.docs) {
         for (let i = 0; i < docs.docs.length; i++) {
            docs.docs[i] = await this.transformProductDetail(docs.docs[i], appendDetailData, isTranslate);
         }
         return {
            ...docs,
            ...appendListData,
         };
      } else {
         for (let i = 0; i < docs.length; i++) {
            docs[i] = await this.transformProductDetail(docs[i], appendDetailData, isTranslate);
         }
         return docs;
      }
   }

   async transformProductDetail(doc, appendData = {}, isTranslate = false) {
      if (!doc || doc == doc._id) return doc;
      await saveFileContent('page', doc, 'products', false);
      return {
         id: doc._id,
         name: doc.name,
         slug: doc.slug,
         content: doc.content,
         title: doc.title,
         rating: doc.rating,
         info: doc.info,
         subname: doc.subname,
         description: doc.description,
         category: doc.category,
         page: doc.page,
         // quantity: doc.quantity,
         sortOrder: doc.sortOrder,
         image: doc.image ? (typeof doc.thumb === 'function' ? doc.thumb('image') : doc.image) : '',
         country: doc.country,
         countryName: doc.countryName,
         // price: doc.price,
         verified: doc.verified,
         deletedAt: doc.deletedAt ? doc.deletedAt : null,
         createdAt: moment(doc.createdAt).format('MMMM Do YYYY'),
         updatedAt: moment(doc.updatedAt).format('MMMM Do YYYY'),
         ...appendData,
      };
   }

   transformProductExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
      return {
         excel: {
            name: fileName || `Products-${moment().format('DD-MM-YYYY')}`,
            data:
               docs.length > 0
                  ? docs.map(function (doc) {
                     return {
                        id: `${doc._id}`,
                        name: doc.name,
                        slug: doc.slug,
                        // quantity: doc.quantity,
                        content: doc.content.join(', '),
                        category: doc.category,
                        image: doc.image ? doc.thumb('image') : '',
                        // price: doc.price,
                        createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
                     };
                  })
                  : [{}],
            customHeaders: customHeaders || [
               'ID',
               'Name',
               'Slug',
               // 'Quantity',
               'Content',
               'Category',
               'Image',
               // 'Price',
               'Created At',
            ],
         },
      };
   }
}
