import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DateTime } from '@core/constants/dateTime.enum';
import { TransformerProductService } from '@src/common/product/services/transformerProduct.service';
const moment = require('moment');

@Injectable({ scope: Scope.REQUEST })
export class TransformerOrderService {
   private locale;

   constructor(@Inject(REQUEST) private request: any, private readonly transformerProductService: TransformerProductService) {
      this.locale = this.request.locale;
   }

   async transformOrderList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
      const self = this;
      if (docs.docs) {
         docs.docs = docs.docs.map(function (doc) {
            return self.transformOrderDetail(doc, appendDetailData, isTranslate);
         });
         docs.docs = await Promise.all(docs.docs);
         return {
            ...docs,
            ...appendListData,
         };
      } else {
         docs = docs.map(function (doc) {
            return self.transformOrderDetail(doc, appendDetailData, isTranslate);
         });
         docs = await Promise.all(docs);

         return docs;
      }
   }

   async transformOrderDetail(doc, appendData = {}, isTranslate = false) {
      if (!doc || doc == doc._id) return doc;
      return {
         id: doc._id,
         customer: doc.customer,
         product: await this.transformerProductService.transformProductDetail(doc.product),
         price: doc.price,
         quantity: doc.quantity,
         deletedAt: doc.deletedAt ? doc.deletedAt : null,
         createdAt: moment(doc.createdAt).format('MMMM Do YYYY'),
         updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
         ...appendData,
      };
   }

   transformOrderExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
      return {
         excel: {
            name: fileName || `Order-${moment().format('DD-MM-YYYY')}`,
            data:
               docs.length > 0
                  ? docs.map(function (doc) {
                     return {
                        id: `${doc._id}`,
                        customer: doc.customer,
                        product: doc.product?.name,
                        price: doc.price,
                        quantity: doc.quantity,
                        createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
                     };
                  })
                  : [{}],
            customHeaders: customHeaders || ['ID', 'Customer', 'Product', 'Name', 'Quantity', 'Created At'],
         },
      };
   }
}

