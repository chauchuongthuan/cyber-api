import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import  from 'mongoose';
import { isIn, isNotEmpty } from 'class-validator';
import { PaginateModel } from 'mongoose';
import { convertContentFileDto, saveFileContent, saveThumbOrPhotos } from '@core/helpers/content';
import { Product } from '@src/schemas/product/product.schema';
import { Category } from '@src/schemas/category/category.schema';
import { HelperService } from '@src/core/services/helper.service';
import { TransformerProductService } from './transformerProduct.service';
const moment = require('moment');
@Injectable()
export class ProductService {
   constructor(
      @InjectModel(Product.name) private product: PaginateModel<Product>,
      @InjectModel(Category.name) private category: PaginateModel<Category>,
      private helperService: HelperService,
      private transformer: TransformerProductService,
   ) {}

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

      if (isNotEmpty(query.name)) {
         conditions['name'] = {
            $regex: new RegExp(query.name, 'img'),
         };
      }

      if (isNotEmpty(query.keyword)) {
         let category = await this.category.find({ slug: { $regex: new RegExp(query.keyword, 'img') }, deletedAt: null });
         
         if (category.length > 0) {
            conditions['$or'] = [
               { name: { $regex: new RegExp(query.keyword, 'img') } },
               { description: { $regex: new RegExp(query.keyword, 'img') } },
               { category: { $in: category.map((item) => item._id) } },
            ];
         } else {
            conditions['$or'] = [
               { name: { $regex: new RegExp(query.keyword, 'img') } },
               { description: { $regex: new RegExp(query.keyword, 'img') } },
            ];
         }
         
      }

      if (isNotEmpty(query.unCategory) && (query.unCategory == true || query.unCategory == 'true')) {
         let unCategory = await this.category.findOne({ unCategory: true, deletedAt: null });
         if (unCategory) {
            conditions['category'] = {
               $in: [unCategory._id],
            };
         }
      }
      if (isNotEmpty(query.category)) {
         let category = await this.category.findOne({ slug: query.category });
         conditions['category'] = {
            $in: [category._id],
         };
      }
      if (isNotEmpty(query.categoryId)) {
         conditions['category'] = {
            $in: [query.categoryId],
         };
      }
      if (isNotEmpty(query.nameNon)) {
         conditions['slug'] = {
            $regex: new RegExp(query.slug, 'img'),
         };
      }
      if (isNotEmpty(query.countryName)) {
         conditions['countryName'] = {
            $regex: new RegExp(query.countryName, 'img'),
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
         const result = this.product.find(conditions).sort(sort).select(projection).populate('category');
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.product.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
            populate: ['category'],
         });
      }
   }

   async productByCategory(): Promise<any> {
      const categories = await this.category.find({ deletedAt: null });
      const result = await Promise.all(
         categories.map(async (category) => {
            const products = await this.product.aggregate([
               {
                  $match: {
                     category: category._id,
                     deletedAt: null,
                  },
               },
               {
                  $sample: {
                     size: 10,
                  },
               },
            ]);
            return {
               category: {
                  name: category.name,
                  slug: category.slug,
                  numberOfAllProduct: await this.product.countDocuments({ category: category._id, deletedAt: null }),
               },
               products: products.map((item) => {
                  return {
                     id: item._id,
                     name: item?.name,
                     slug: item?.slug,
                     description: item?.description,
                     countryName: item?.countryName,
                     country: item?.country,
                     price: item?.price,
                     verified: item?.verified,
                     image: item.image ? `${process.env.NODE_URL}/${process.env.PREFIX_UPLOAD}/posts/${item._id}/image/${item.image}` : '',
                     createdAt: moment(item.createdAt).format('MMMM Do YYYY'),
                     updatedAt: moment(item.updatedAt).format('MMMM Do YYYY'),
                  };
               }),
            };
         }),
      );
      return result;
   }
   async findOne(query: Record<string, any>): Promise<Product> {
      return this.product.findOne(query);
   }

   async create(data: object, files: Record<any, any>): Promise<any> {
      let exist = await this.product.findOne({
         slug: data['slug'],
      });
      if (exist) return this.helperService.throwException('Slug is exist');
      files.forEach((file) => {
         let fields = file.fieldname.replaceAll('[', ' ').replaceAll(']', '').split(' ');
         fields = fields.filter((field) => isNotEmpty(field));
         this.assignStringFieldToObject(data, fields, file.filename);
      });
      // await convertContentFileDto(data, files, ['image', 'country']);
      const item = await new this.product(data).save();
      if (item) {
         await Promise.all([saveThumbOrPhotos(item), saveFileContent('page', item, 'products', true)]);
      }

      return item;
   }
   assignStringFieldToObject(data: any, fields: Array<any>, value: any) {
      if (fields.length == 1) {
         data[fields[0]] = value;
      } else {
         const field = fields.shift();
         this.assignStringFieldToObject(data[field], fields, value);
      }
   }
   async update(id: string, data: object, files: Record<any, any>): Promise<Product> {
      files.forEach((file) => {
         let fields = file.fieldname.replaceAll('[', ' ').replaceAll(']', '').split(' ');
         fields = fields.filter((field) => isNotEmpty(field));
         this.assignStringFieldToObject(data, fields, file.filename);
      });
      // await convertContentFileDto(data, files, ['image', 'country']);
      const item = await this.product.findByIdAndUpdate(id, data, { returnOriginal: false });
      if (item) {
         await Promise.all([saveThumbOrPhotos(item), saveFileContent('page', item, 'products', true)]);
      }
      return item;
   }

   async deletes(ids: Array<string>): Promise<any> {
      return this.product.deleteMany({ _id: { $in: ids } }, { deletedAt: new Date() });
   }

   async detail(id: string): Promise<Product> {
      return this.product.findById(id);
   }
   async findBySlug(slug: string): Promise<Product> {
      return this.product.findOne({ slug }).populate('category');
   }
}
