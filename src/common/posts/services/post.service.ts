import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { isNotEmpty, isIn } from 'class-validator';
import { Post } from '@schemas/posts/post.schemas';
import { StatusEnum } from '@core/constants/post.enum';
import { convertContentFileDto, saveThumbOrPhotos } from '@core/helpers/content';
import { HelperService } from '@core/services/helper.service';
const moment = require('moment');
@Injectable()
export class PostService {
   private defaultStatus;

   constructor(
      @InjectModel(Post.name) private post: PaginateModel<Post>,
      @Inject(REQUEST) private request: any,
      private helper: HelperService,
   ) {
      this.defaultStatus = StatusEnum.IN_DRAFT;
   }

   async totalPost(): Promise<any> {
      return this.post.countDocuments();
   }

   async totalNewPost(): Promise<any> {
      return this.post.countDocuments({ status: StatusEnum.NEW });
   }

   async totalReviewPost(): Promise<any> {
      return this.post.countDocuments({ status: StatusEnum.IN_REVIEW });
   }

   async totalPublishedPost(): Promise<any> {
      return this.post.countDocuments({ status: StatusEnum.PUBLISHED });
   }

   async totalDraftPost(): Promise<any> {
      return this.post.countDocuments({ status: StatusEnum.IN_DRAFT });
   }

   async totalInActivePost(): Promise<any> {
      return this.post.countDocuments({ status: StatusEnum.IN_ACTIVE });
   }

   async findAll(query: Record<string, any>, isFe = false): Promise<any> {
      const conditions = {};
      conditions['deletedAt'] = null;
      const sort = Object();

      const projection = {};
      // if (isFe) {
      //    let listFieldSort = ['createdAt', 'slug', 'category'];
      //    let listKeySort = ['DESC', 'ASC'];
      //    let pickFieldSort = listFieldSort[Math.floor(Math.random() * 3)];
      //    let pickKeySort = listKeySort[Math.floor(Math.random() * 2)];
      //    sort[pickFieldSort] = pickKeySort;
      // } else {
      //    sort[query.orderBy] = query.order;
      // }
      sort['createdAt'] = 'DESC';
      if (isNotEmpty(query.selects)) {
         query.selects.split(',').forEach((select) => {
            projection[select] = 1;
         });
      }

      if (isNotEmpty(query.title)) {
         conditions['title'] = {
            $regex: new RegExp(query.title, 'img'),
         };
      }
      if (isNotEmpty(query.featured)) {
         conditions['featured'] = true;
      }
      if (isNotEmpty(query.slug)) {
         conditions['slug'] = {
            $regex: new RegExp(query.slug, 'img'),
         };
      }

      if (isNotEmpty(query.author)) {
         conditions['author'] = {
            $regex: new RegExp(query.author, 'img'),
         };
      }

      if (isNotEmpty(query.idNotIn)) {
         conditions['_id'] = {
            $nin: query.idNotIn,
         };
      }

      if (isNotEmpty(query.idIn)) {
         conditions['_id'] = {
            $in: query.idIn,
         };
      }
      if (isNotEmpty(query.createdFrom) || isNotEmpty(query.createdTo)) {
         const createdFrom = moment(query.createdFrom || '1000-01-01').startOf('day');
         const createdTo = moment(query.createdTo || '3000-01-01').endOf('day');
         conditions[`createdAt`] = {
            $gte: createdFrom,
            $lte: createdTo,
         };
      }

      if (isNotEmpty(query.get)) {
         const get = parseInt(query.get);
         const result = this.post.find(conditions).sort(sort).select(projection);
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.post.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
         });
      }
   }

   // async findAllFrontend(query: Record<string, any>): Promise<any> {
   //    const locale = this.locale;
   //    const conditions = {};
   //    conditions['status'] = StatusEnum.PUBLISHED;
   //    conditions['publishedAt'] = { $lte: moment().format('DD-MM-YYYY HH:mm:ss') };
   //    const sort = Object();
   //    query.orderBy =
   //       ['title', 'shortDescription'].indexOf(query.orderBy) != -1 ? `${query.orderBy}.${this.locale}` : query.orderBy;
   //    sort[query.orderBy] = query.order;

   //    const projection = {};

   //    if (isNotEmpty(query.selects)) {
   //       query.selects.split(',').forEach((select) => {
   //          projection[select] = 1;
   //       });
   //    }

   //    if (isNotEmpty(query.title)) {
   //       // conditions[`title.${locale}`] = {
   //       //     $regex: new RegExp(query.title, "img"),
   //       // };
   //       const title = await this.helper.nonAccentVietnamese(query.title);
   //       conditions[`title.${locale}`] = {
   //          $regex: new RegExp(title, 'img'),
   //       };
   //    }

   //    if (isNotEmpty(query.tagIdIn)) {
   //       conditions['tags'] = {
   //          $in: query.tagIdIn,
   //       };
   //    }

   //    if (isNotEmpty(query.postCategory)) {
   //       conditions['postCategory'] = query.postCategory;
   //    }

   //    if (isNotEmpty(query.idNotIn)) {
   //       conditions['_id'] = {
   //          $nin: query.idNotIn,
   //       };
   //    }

   //    if (isNotEmpty(query.idIn)) {
   //       conditions['_id'] = {
   //          $in: query.idIn,
   //       };
   //    }

   //    if (isIn(query['feature'], ['true', 'false', true, false])) {
   //       conditions['feature'] = query['feature'];
   //    }

   //    if (isNotEmpty(query.createdFrom) || isNotEmpty(query.createdTo)) {
   //       const createdFrom = moment(query.createdFrom || '1000-01-01').startOf('day');
   //       const createdTo = moment(query.createdTo || '3000-01-01').endOf('day');
   //       conditions[`createdAt`] = {
   //          $gte: createdFrom,
   //          $lte: createdTo,
   //       };
   //    }

   //    if (isNotEmpty(query.get)) {
   //       const get = parseInt(query.get);
   //       const result = this.post.find(conditions).sort(sort).select(projection);
   //       return isNaN(get) ? result : result.limit(get);
   //    } else {
   //       return this.post.paginate(conditions, {
   //          populate: query.populate || [],
   //          select: projection,
   //          page: query.page,
   //          limit: query.limit,
   //          sort: sort,
   //       });
   //    }
   // }

   async findById(id: string): Promise<Post | boolean> {
      const item = await this.post.findById(id);

      return item;
   }

   async findBySlug(slug: string): Promise<Post> {
      const conditions = {};
      conditions[`slug`] = slug;
      return await this.post.findOne(conditions);
   }

   async create(data: object, files: Record<any, any>): Promise<Post> {
      await convertContentFileDto(data, files, ['image']);

      const item = await new this.post(data).save();
      if (item) await saveThumbOrPhotos(item);
      return item;
   }

   async update(id: string, data: object, files: Record<any, any>): Promise<any> {
      let item = await this.findById(id);
      if (!item) return false;
      //
      await convertContentFileDto(data, files, ['image']);

      item = await this.post.findByIdAndUpdate(id, data, { new: true });
      if (item) await saveThumbOrPhotos(item);
      return item;
   }

   async deleteManyById(ids: Array<string>): Promise<any> {
      await this.post.deleteMany({
         _id: {
            $in: ids,
         },
      });

      return true;
   }
}
