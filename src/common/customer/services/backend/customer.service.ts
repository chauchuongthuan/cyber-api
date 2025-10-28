import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import  from 'mongoose';
import { isIn, isNotEmpty } from 'class-validator';
import { PaginateModel } from 'mongoose';
import { HelperService } from '@core/services/helper.service';
import { Customer } from '@schemas/customer/customer.schemas';
import { convertContentFileDto, saveThumbOrPhotos } from '@core/helpers/content';
const moment = require('moment');
@Injectable()
export class CustomerService {
   constructor(@InjectModel(Customer.name) private customer: PaginateModel<Customer>, private helperService: HelperService) {}

   async findAll(query: Record<string, any>): Promise<any> {
      const conditions = {};
      conditions['deletedAt'] = null;
      const sort = Object();
      sort[query.orderBy] = query.order;

      const projection = {};

      if (isNotEmpty(query.selects)) {
         query.selects.split(',').forEach((select) => {
            projection[select] = 1;
         });
      }

      if (isNotEmpty(query.name)) {
         const nameNon = this.helperService.removeSignVietnamese(query['name']);
         conditions['nameNon'] = {
            $regex: new RegExp(nameNon, 'img'),
         };
      }

      if (isNotEmpty(query.email)) {
         conditions['email'] = {
            $regex: new RegExp(query.email, 'img'),
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
         const result = this.customer.find(conditions).sort(sort).select(projection);
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.customer.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
         });
      }
   }

   async findOne(query: Record<string, any>): Promise<Customer> {
      return this.customer.findOne(query);
   }

   async create(data: object, files: Record<any, any>): Promise<{ status: boolean; message?: string; data?: any }> {
      try {
         const roleType = data['roleType'];

         let clickTime = 0;
         let roleAssignedAt = null;
         let lastReset = null;
         if (roleType) {
            switch (roleType) {
               case 'silver':
                  clickTime = 7;
                  roleAssignedAt = new Date();
                  lastReset = new Date();
                  break;
               case 'gold':
                  clickTime = 10;
                  roleAssignedAt = new Date();
                  lastReset = new Date();
                  break;
               case 'platinum':
                  clickTime = 15;
                  roleAssignedAt = new Date();
                  lastReset = new Date();
                  break;
               default:
                  break;
            }
         }
         // data['nameNon'] = this.helperService.nonAccentVietnamese(data['name']);
         // data['consultantsNon'] = this.helperService.nonAccentVietnamese(data['consultants']);
         data['password'] = await this.helperService.hash(data['password']);
         // await convertContentFileDto(data, files, ['profileImage']);
         const item = await new this.customer({...data, clickTime, roleAssignedAt, lastReset}).save();
         // if (item) await saveThumbOrPhotos(item);
         return { status: true, data: item };
      } catch (error) {
         const rs = { status: false, message: 'Tạo thất bại!' };
         if (error.code == 11000) {
            const fields = Object.keys(error.keyPattern);
            if (fields.includes('email')) rs.message = 'Email đã được đăng ký!';
            if (fields.includes('phone')) rs.message = 'Số điện thoại đã được đăng ký!';
         }
         return rs;
      }
   }

   async update(id: string, data: object, files: Record<any, any>): Promise<{ status: boolean; message?: string; data?: any }> {
      try {
         const roleType = data['roleType'];

         let clickTime = 0;
         let roleAssignedAt = null;
         let lastReset = null;
         if (roleType) {
            switch (roleType) {
               case 'silver':
                  clickTime = 7;
                  roleAssignedAt = new Date();
                  lastReset = new Date();
                  break;
               case 'gold':
                  clickTime = 10;
                  roleAssignedAt = new Date();
                  lastReset = new Date();
                  break;
               case 'platinum':
                  clickTime = 15;
                  roleAssignedAt = new Date();
                  lastReset = new Date();
                  break;
               default:
                  break;
            }
         }
         if (data['password']) {
            data['password'] = await this.helperService.hash(data['password']);
         } else delete data['password'];
         // await convertContentFileDto(data, files, ['profileImage']);
         const item = await this.customer.findByIdAndUpdate(id, {...data, clickTime, roleAssignedAt, lastReset}, { returnOriginal: false });
         // if (item) await saveThumbOrPhotos(item);
         return { status: true, data: item };
      } catch (error) {
         const rs = { status: false, message: 'Tạo thất bại!' };
         if (error.code == 11000) {
            const fields = Object.keys(error.keyPattern);
            if (fields.includes('email')) rs.message = 'Email đã được đăng ký!';
            if (fields.includes('phone')) rs.message = 'Số điện thoại đã được đăng ký!';
         }
         return rs;
      }
   }

   async detail(id: string): Promise<Customer> {
      return this.customer.findById(id);
   }

   async deletes(ids: Array<string>): Promise<any> {
      return this.customer.deleteMany({ _id: { $in: ids } }, { deletedAt: new Date() });
   }

   async changeStatus(data: any) {
      const item = await this.customer.findByIdAndUpdate(data.id, { active: data.active }, { returnOriginal: false });
      return item;
   }
}
