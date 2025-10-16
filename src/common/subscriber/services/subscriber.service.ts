import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import  from 'mongoose';
import { isIn, isNotEmpty } from 'class-validator';
import { PaginateModel } from 'mongoose';
import { HelperService } from '@core/services/helper.service';
import { Customer } from '@schemas/customer/customer.schemas';
import { convertContentFileDto, saveThumbOrPhotos } from '@core/helpers/content';
import { Subscriber } from '@src/schemas/subscriber/subscriber.schema';
import { ChangeStatusDto } from '../dto/beSubcriber.dto';

const moment = require('moment');
@Injectable()
export class SubscriberService {
   constructor(@InjectModel(Subscriber.name) private subscriber: PaginateModel<Subscriber>) { }

   async findAll(query: Record<string, any>): Promise<any> {
      const conditions = {};
      if (query.isFe) {
         conditions['deletedAt'] = null;
      }
      const sort = Object();
      sort[query.orderBy] = query.order;

      const projection = {};

      if (isNotEmpty(query.selects)) {
         query.selects.split(',').forEach((select) => {
            projection[select] = 1;
         });
      }

      if (isNotEmpty(query.email)) {
         conditions['email'] = {
            $regex: new RegExp(query.email, 'img'),
         };
      }

      if (isNotEmpty(query.status)) {
         conditions['status'] = {
            $eq: query.status,
         };
      }
      
      if (isNotEmpty(query.customer)) {
         conditions['customer'] = query.customer
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
         const result = this.subscriber.find(conditions).sort(sort).select(projection).populate('customer');
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.subscriber.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
            populate: ['customer']
         });
      }
   }

   async findOne(query: Record<string, any>): Promise<Subscriber> {
      return this.subscriber.findOne(query);
   }

   async create(data: object): Promise<Subscriber> {
      const item = await new this.subscriber(data).save();
      return item;
   }

   async update(id: string, data: object): Promise<Subscriber> {
      const item = await this.subscriber.findByIdAndUpdate(id, data, { returnOriginal: false });
      return item;
   }

   async deletes(ids: Array<string>): Promise<any> {
      return this.subscriber.updateMany({ _id: { $in: ids } }, { deletedAt: new Date() });
   }

   async detail(id: string): Promise<Subscriber> {
      return this.subscriber.findById(id);
   }

   async changeStatus(data: any) {
      const item = await this.subscriber.findByIdAndUpdate(data.id, { status: data.status }, { returnOriginal: false });
      return item;
   }
}
