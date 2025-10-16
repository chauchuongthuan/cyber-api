import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import  from 'mongoose';
import { isIn, isNotEmpty } from 'class-validator';
import { PaginateModel } from 'mongoose';
import { HelperService } from '@core/services/helper.service';
import { Customer } from '@schemas/customer/customer.schemas';
import { convertContentFileDto, saveThumbOrPhotos } from '@core/helpers/content';
import { Payment } from '@src/schemas/payment/payment.schema';
import { PaymentStatusEnum, PaymentTypeCodeTrans, PaymentTypeTrans } from '@src/core/constants/payment.enum';
import { EmailService } from '@src/common/email/email.service';
import { randStr } from '@src/core/helpers/file';
const moment = require('moment');
@Injectable()
export class PaymentService {
   constructor(
      @InjectModel(Payment.name) private payment: PaginateModel<Payment>,
      private helper: HelperService,
      @InjectModel(Customer.name) private customer: PaginateModel<Customer>,
      private emailService: EmailService,
   ) { }

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
         conditions['name'] = {
            $regex: new RegExp(query.name, 'img'),
         };
      }

      if (isNotEmpty(query.status)) {
         conditions['status'] = query.status;
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
         const result = this.payment.find(conditions).sort(sort).select(projection).populate('customer');
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.payment.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
            populate: ['customer'],
         });
      }
   }
   async findAllFe(query: Record<string, any>, customer: Customer): Promise<any> {
      const conditions = {};
      conditions['deletedAt'] = null;
      conditions['deletedFeAt'] = null;
      conditions['customer'] = customer.id;
      const sort = Object();
      sort[query.orderBy] = query.order;

      const projection = {};

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
         const result = this.payment.find(conditions).sort(sort).select(projection);
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.payment.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
         });
      }
   }

   async findOne(query: Record<string, any>): Promise<Payment> {
      return this.payment.findOne(query);
   }

   async create(data: object): Promise<any> {
      if (!Number(data['usd']) || Number(data['usd']) < 10) return this.helper.throwException('Minimum amount deposit 10$');
      try {
         if (data['type'] != 2 && data['type'] != 3 && data['type'] != 7) {
            let code = PaymentTypeCodeTrans(data['type']);
            let res = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${code}`);
            let rate = await res.json();
            if (!rate[code]) return false;
            data['coin'] = rate[code] * data['usd'];
         } else {
            data['coin'] = data['usd'];
         }
         let key: string = await randStr(6);
         let keyHas: string = await this.helper.encryptKey(key);
         data['key'] = key;
         const item = await new this.payment(data).save();

         let customer: Customer = await this.customer.findById(data['customer']);
         this.emailService.newPayment(
            customer?.email,
            customer.username,
            data['usd'],
            PaymentTypeTrans(data['type']),
            data['coin'],
         );
         return {
            data: item,
            key: keyHas,
         };
      } catch (error) {
         console.log(`error---->`, error);
      }
   }

   async cancelPayment(id) {
      await this.payment.deleteOne({ _id: id });
   }
   async successPayment(id: string, dto: any) {
      let { key } = dto;
      let payment = await this.payment.findOneAndUpdate(
         {
            _id: id,
            key,
            status: PaymentStatusEnum.UNPAID,
         },
         {
            status: PaymentStatusEnum.PAID,
         },
      );
      if (payment) {
         await this.customer.findOneAndUpdate({ _id: payment.customer }, { $inc: { balance: payment.usd } });
      }
      return payment;
   }

   async update(id: string, data: object): Promise<Payment> {
      const item = await this.payment.findByIdAndUpdate(id, data, { returnOriginal: false });
      if (item.status == PaymentStatusEnum.PAID) {
         await this.customer.findOneAndUpdate({ _id: item.customer }, { $inc: { balance: item.usd } });
      } else if (item.status == PaymentStatusEnum.UNPAID) {
         await this.customer.findOneAndUpdate({ _id: item.customer }, { $inc: { balance: -item.usd } });
      }
      return item;
   }

   async deletes(ids: Array<string>): Promise<any> {
      return this.payment.updateMany({ _id: { $in: ids } }, { deletedAt: new Date() });
   }

   async deletesFe(ids: Array<string>): Promise<any> {
      return this.payment.updateMany({ _id: { $in: ids } }, { deletedFeAt: new Date() });
   }

   async detail(id: string): Promise<Payment> {
      return this.payment.findById(id);
   }
   // async findBySlug(slug: string): Promise<Payment> {
   //    return this.payment.findOne({ slug });
   // }
}

