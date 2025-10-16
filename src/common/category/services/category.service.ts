import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import  from 'mongoose';
import { isIn, isNotEmpty } from 'class-validator';
import { PaginateModel } from 'mongoose';
import { HelperService } from '@core/services/helper.service';
import { Customer } from '@schemas/customer/customer.schemas';
import { convertContentFileDto, saveThumbOrPhotos } from '@core/helpers/content';
import { Category } from '@src/schemas/category/category.schema';
const moment = require('moment');
@Injectable()
export class CategoryService {
   constructor(@InjectModel(Category.name) private category: PaginateModel<Category>, private helper: HelperService) { }

   async findAll(query: Record<string, any>, isFe = false): Promise<any> {
      const conditions = {};
      conditions['deletedAt'] = null;
      const sort = Object();
      sort[query.orderBy] = query.order;

      const projection = {};

      if (isFe) {
         let unCategory = await this.category.findOne({ unCategory: true, deletedAt: null });
         if (unCategory)
            conditions['_id'] = {
               $nin: [unCategory._id],
            };
      }

      if (isNotEmpty(query.sortOrderLt)) {
         conditions[`sortOrder`] = {
            $lt: query.sortOrderLt,
         };
      }
      if (isNotEmpty(query.sortOrderGt)) {
         conditions[`sortOrder`] = {
            $gt: query.sortOrderGt,
         };
      }

      if (isNotEmpty(query.selects)) {
         query.selects.split(',').forEach((select) => {
            projection[select] = 1;
         });
      }


      if (isNotEmpty(query.name)) {
         conditions['name'] = {
            $regex: new RegExp(query.name, 'img'),
         };
      }

      if (isNotEmpty(query.nameNon)) {
         conditions['slug'] = {
            $regex: new RegExp(query.slug, 'img'),
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
         const result = this.category.find(conditions).sort(sort).select(projection);
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.category.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
         });
      }
   }

   async findOne(query: Record<string, any>): Promise<Category> {
      return this.category.findOne(query);
   }

   async create(data: object): Promise<Category> {
      if (!data['slug']) data['slug'] = this.helper.slug(data['name']);
      let exist = await this.category.findOne({ slug: data['slug'] });
      if (exist) this.helper.throwException('Slug is exist');
      const item = await new this.category(data).save();
      return item;
   }

   async update(id: string, data: object): Promise<Category> {
      const item = await this.category.findByIdAndUpdate(id, data, { returnOriginal: false });
      return item;
   }

   async deletes(ids: Array<string>): Promise<any> {
      return this.category.deleteMany({ _id: { $in: ids } }, { deletedAt: new Date() });
   }

   async detail(id: string): Promise<Category> {
      return this.category.findById(id);
   }
   async findBySlug(slug: string): Promise<Category> {
      return this.category.findOne({ slug });
   }
}
