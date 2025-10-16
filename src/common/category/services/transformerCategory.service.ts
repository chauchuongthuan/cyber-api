import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DateTime } from '@core/constants/dateTime.enum';
const moment = require('moment');

@Injectable({ scope: Scope.REQUEST })
export class TransformerCategoryService {
   private locale;

   constructor(
      @Inject(REQUEST) private request: any, // private readonly transformerRole: TransformerRoleService,
   ) {
      this.locale = this.request.locale;
   }

   transformCategoryList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
      const self = this;
      if (docs.docs) {
         docs.docs = docs.docs.map(function (doc) {
            return self.transformCategoryDetail(doc, appendDetailData, isTranslate);
         });
         return {
            ...docs,
            ...appendListData,
         };
      } else {
         docs = docs.map(function (doc) {
            return self.transformCategoryDetail(doc, appendDetailData, isTranslate);
         });
         return docs;
      }
   }

   transformCategoryDetail(doc, appendData = {}, isTranslate = false) {
      if (!doc || doc == doc._id) return doc;
      return {
         id: doc._id,
         name: doc.name,
         slug: doc.slug,
         unCategory: doc.unCategory,
         sortOrder: doc.sortOrder,
         deletedAt: doc.deletedAt ? doc.deletedAt : null,
         createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
         updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
         ...appendData,
      };
   }

   transformCategoryExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
      return {
         excel: {
            name: fileName || `Category-${moment().format('DD-MM-YYYY')}`,
            data:
               docs.length > 0
                  ? docs.map(function (doc) {
                     return {
                        id: `${doc._id}`,
                        name: doc.name,
                        slug: doc.slug,
                        createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
                        updatedAt: moment(doc.updatedAt).format(DateTime.CREATED_AT),
                     };
                  })
                  : [{}],
            customHeaders: customHeaders || ['ID', 'Name', 'Slug'],
         },
      };
   }
}
