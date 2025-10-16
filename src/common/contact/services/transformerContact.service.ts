import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DateTime } from '@core/constants/dateTime.enum';
const moment = require('moment');

@Injectable({ scope: Scope.REQUEST })
export class TransformerContactService {
   constructor(
      @Inject(REQUEST) private request: any, // private readonly transformerRole: TransformerRoleService,
   ) { }

   transformContactList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
      const self = this;
      if (docs.docs) {
         docs.docs = docs.docs.map(function (doc) {
            return self.transformContactDetail(doc, appendDetailData, isTranslate);
         });
         return {
            ...docs,
            ...appendListData,
         };
      } else {
         docs = docs.map(function (doc) {
            return self.transformContactDetail(doc, appendDetailData, isTranslate);
         });
         return docs;
      }
   }

   transformContactDetail(doc, appendData = {}, isTranslate = false) {
      if (!doc || doc == doc._id) return doc;
      return {
         id: doc._id,
         name: doc.name,
         email: doc.email,
         taskType: doc.taskType,
         priority: doc?.priority,
         subject: doc.subject,
         message: doc.message,
         deletedAt: doc.deletedAt ? doc.deletedAt : null,
         createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
         updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
         ...appendData,
      };
   }

   transformContactExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
      return {
         excel: {
            name: fileName || `Contacts-${moment().format('DD-MM-YYYY')}`,
            data:
               docs.length > 0
                  ? docs.map(function (doc) {
                     let messageFile = null;
                     if (doc.messageFile) {
                        doc.messageFile.includes('http') || doc.messageFile.includes('https')
                           ? (messageFile = doc.messageFile)
                           : (messageFile = doc.thumb('messageFile', 'FB'));
                     }
                     return {
                        id: `${doc._id}`,
                        name: doc.name,
                        email: doc.email,
                        taskType: doc.taskType,
                        priority: doc?.priority,
                        subject: doc.subject,
                        message: doc.message,
                        createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
                        updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
                     };
                  })
                  : [{}],
            customHeaders: customHeaders || [
               'ID',
               'Name',
               'Email',
               'taskType',
               'priority',
               'subject',
               'Message',
               'createdAt',
               'Date Modified',
            ],
         },
      };
   }
}
