import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DateTime } from '@core/constants/dateTime.enum';
import { PaymentStatusTrans, PaymentTypeTrans } from '@src/core/constants/payment.enum';
const moment = require('moment');

@Injectable({ scope: Scope.REQUEST })
export class TransformerPaymentService {
   private locale;

   constructor(
      @Inject(REQUEST) private request: any, // private readonly transformerRole: TransformerRoleService,
   ) {
      this.locale = this.request.locale;
   }

   transformPaymentList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
      const self = this;
      if (docs.docs) {
         docs.docs = docs.docs.map(function (doc) {
            return self.transformPaymentDetail(doc, appendDetailData, isTranslate);
         });
         return {
            ...docs,
            ...appendListData,
         };
      } else {
         docs = docs.map(function (doc) {
            return self.transformPaymentDetail(doc, appendDetailData, isTranslate);
         });
         return docs;
      }
   }

   transformPaymentDetail(doc, appendData = {}, isTranslate = false) {
      if (!doc || doc == doc._id) return doc;
      return {
         id: doc._id,
         customer: doc.customer,
         type: isTranslate ? PaymentTypeTrans(doc.type) : doc.type,
         coin: doc.coin,
         usd: doc.usd,
         status: doc.status,
         deletedAt: doc.deletedAt ? doc.deletedAt : null,
         deletedFeAt: doc.deletedFeAt ? doc.deletedFeAt : null,
         createdAt: moment(doc.createdAt).format('MMMM Do YYYY'),
         updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
         ...appendData,
      };
   }

   transformPaymentExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
      return {
         excel: {
            name: fileName || `Payment-${moment().format('DD-MM-YYYY')}`,
            data:
               docs.length > 0
                  ? docs.map(function (doc) {
                     return {
                        id: `${doc._id}`,
                        customer: doc.customer?.name,
                        type: PaymentTypeTrans(doc.type),
                        coin: doc.coin,
                        usd: doc.usd,
                        status: PaymentStatusTrans(doc.status),
                        deletedAt: doc.deletedAt ? doc.deletedAt : null,
                        deletedFeAt: doc.deletedFeAt ? doc.deletedFeAt : null,
                        createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
                        updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
                     };
                  })
                  : [{}],
            customHeaders: customHeaders || ['ID', 'Customer', 'Type', 'Coin', 'USD', 'Status', 'Deleted At', 'Deleted Fe At', 'Created At', 'Updated At'],
         },
      };
   }
}
