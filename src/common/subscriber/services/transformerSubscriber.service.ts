import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DateTime } from '@core/constants/dateTime.enum';
import { ReasonEnum } from '@src/core/constants/reason.enum';
const moment = require('moment');

@Injectable({ scope: Scope.REQUEST })
export class TransformerSubscriberService {
   constructor(
      @Inject(REQUEST) private request: any, // private readonly transformerRole: TransformerRoleService,
   ) { }

   transformSubscriberList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
      const self = this;
      if (docs.docs) {
         docs.docs = docs.docs.map(function (doc) {
            return self.transformSubscriberDetail(doc, appendDetailData, isTranslate);
         });
         return {
            ...docs,
            ...appendListData,
         };
      } else {
         docs = docs.map(function (doc) {
            return self.transformSubscriberDetail(doc, appendDetailData, isTranslate);
         });
         return docs;
      }
   }

   transformSubscriberDetail(doc, appendData = {}, isTranslate = false) {
      if (!doc || doc == doc._id) return doc;
      return {
         id: doc._id,
         // name: doc.name,
         // email: doc.email,
         taskType: doc.taskType,
         customer: doc.customer,
         priority: doc.priority,
         subject: doc.subject,
         message: doc.message,
         deletedAt: doc.deletedAt ? doc.deletedAt : null,
         createdAt: moment(doc.createdAt).format('MMMM Do YYYY'),
         updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
         ...appendData,
      };
   }

   transformSubscriberExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
      return {
         excel: {
            name: fileName || `Subscribers-${moment().format('DD-MM-YYYY')}`,
            data:
               docs.length > 0
                  ? docs.map(function (doc) {
                     return {
                        id: `${doc._id}`,
                        name: doc.name,
                        email: doc.email,
                        taskType: doc.taskType,
                        customer: doc.customer?.name || doc.customer,
                        priority: doc.priority,
                        subject: doc.subject,
                        message: doc.message,
                        createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
                        updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
                     };
                  })
                  : [{}],
            customHeaders: customHeaders || ['ID', 'Name', 'Email', 'Type', 'customer', 'priority', 'subject', 'message', 'Date'],
         },
      };
   }
}
