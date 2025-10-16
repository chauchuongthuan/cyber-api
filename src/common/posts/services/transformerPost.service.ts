import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DateTime } from '@core/constants/dateTime.enum';
import { StatusTrans } from '@core/constants/post.enum';
const moment = require('moment');
@Injectable({ scope: Scope.REQUEST })
export class TransformerPostService {
   private locale;

   constructor(@Inject(REQUEST) private request: any) {
      this.locale = this.request.locale;
   }

   // transformCategoryList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
   //    const self = this;
   //    if (docs.docs) {
   //       docs.docs = docs.docs.map(function (doc) {
   //          return self.transformCategoryDetail(doc, appendDetailData, isTranslate);
   //       });
   //       return {
   //          ...docs,
   //          ...appendListData,
   //       };
   //    } else {
   //       docs = docs.map(function (doc) {
   //          return self.transformCategoryDetail(doc, appendDetailData, isTranslate);
   //       });
   //       return docs;
   //    }
   // }

   // transformCategoryDetail(doc, appendData = {}, isTranslate = false) {
   //    const locale = this.locale;
   //    const mustTranslate = locale && isTranslate;
   //    if (!doc || doc == doc._id) return doc;
   //    return {
   //       id: doc.id,
   //       title: doc.title,
   //       amount: doc.amount,
   //       createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
   //       ...appendData,
   //    };
   // }

   // transformCategoryExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
   //    return {
   //       excel: {
   //          name: fileName || `PostCategories-${moment().format('DD-MM-YYYY')}`,
   //          data:
   //             docs.length > 0
   //                ? docs.map(function (doc) {
   //                   return {
   //                      id: `${doc._id}`,
   //                      title: doc.title,
   //                      slug: doc.slug,
   //                      shortDescription: doc.shortDescription,
   //                      active: doc.active == true ? 'Có' : 'Không',
   //                      sortOrder: doc.sortOrder,
   //                      createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
   //                   };
   //                })
   //                : [{}],
   //          customHeaders: customHeaders || [
   //             'ID',
   //             'Tiêu đề',
   //             'Slug',
   //             'Mô tả ngắn',
   //             // 'Nội dung',
   //             'Trạng thái',
   //             'Thứ tự',
   //             'Ngày tạo',
   //          ],
   //       },
   //    };
   // }

   transformPostList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
      const self = this;
      if (docs.docs) {
         docs.docs = docs.docs.map(function (doc) {
            return self.transformPostDetail(doc, appendDetailData, isTranslate);
         });
         return {
            ...docs,
            ...appendListData,
         };
      } else {
         docs = docs.map(function (doc) {
            return self.transformPostDetail(doc, appendDetailData, isTranslate);
         });
         return docs;
      }
   }

   transformPostDetail(doc, appendData = {}, isTranslate = false) {
      const locale = this.locale;
      const mustTranslate = locale && isTranslate;
      if (!doc || doc == doc._id) return doc;
      return {
         id: doc.id,
         title: doc.title,
         content: doc.content,
         readTime: doc.readTime,
         author: doc.author,
         image: doc.image ? (typeof doc.thumb === 'function' ? doc.thumb('image') : doc.image) : '',
         createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
         ...appendData,
      };
   }

   transformPostExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
      const self = this;
      return {
         excel: {
            name: fileName || `Posts-${moment().format('DD-MM-YYYY')}`,
            data:
               docs.length > 0
                  ? docs.map(function (doc) {
                     return {
                        id: `${doc._id}`,
                        title: doc.title,
                        content: JSON.stringify(doc.content),
                        readTime: doc.readTime,
                        author: doc.author,
                        image: doc.image,
                        createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
                     };
                  })
                  : [{}],
            customHeaders: customHeaders || ['ID', 'Tiêu đề', 'Nội dung', 'Thời gian đọc', 'Tác giả', 'Hình', 'Ngày tạo'],
         },
      };
   }

   // // Tag
   // transformTagList(docs, appendDetailData = {}, isTranslate = false, appendListData = {}) {
   //    const self = this;
   //    if (docs.docs) {
   //       docs.docs = docs.docs.map(function (doc) {
   //          return self.transformTagDetail(doc, appendDetailData, isTranslate);
   //       });
   //       return {
   //          ...docs,
   //          ...appendListData,
   //       };
   //    } else {
   //       docs = docs.map(function (doc) {
   //          return self.transformTagDetail(doc, appendDetailData, isTranslate);
   //       });
   //       return docs;
   //    }
   // }

   // transformTagDetail(doc, appendData = {}, isTranslate = false) {
   //    const locale = this.locale;
   //    const mustTranslate = locale && isTranslate;
   //    if (!doc || doc == doc._id) return doc;
   //    return {
   //       id: doc.id,
   //       name: doc.name,
   //       slug: doc.slug,
   //       active: doc.active,
   //       sortOrder: doc.sortOrder,
   //       createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
   //       ...appendData,
   //    };
   // }

   // transformTagExport(docs, appendData = {}, fileName?: string, customHeaders?: Array<string>) {
   //    return {
   //       excel: {
   //          name: fileName || `Tags-${moment().format('DD-MM-YYYY')}`,
   //          data:
   //             docs.length > 0
   //                ? docs.map(function (doc) {
   //                   return {
   //                      id: `${doc._id}`,
   //                      name: doc.name,
   //                      slug: doc.slug,
   //                      active: doc.active == true ? 'Có' : 'Không',
   //                      sortOrder: doc.sortOrder,
   //                      createdAt: moment(doc.createdAt).format(DateTime.CREATED_AT),
   //                   };
   //                })
   //                : [{}],
   //          customHeaders: customHeaders || ['ID', 'Tên', 'Slug', 'Trạng thái', 'Thứ tự', 'Ngày tạo'],
   //       },
   //    };
   // }
}
