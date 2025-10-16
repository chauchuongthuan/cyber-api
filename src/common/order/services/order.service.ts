import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import  from 'mongoose';
import { isIn, isNotEmpty } from 'class-validator';
import { PaginateModel } from 'mongoose';
import { HelperService } from '@core/services/helper.service';
import { Customer } from '@schemas/customer/customer.schemas';
import { convertContentFileDto, saveThumbOrPhotos } from '@core/helpers/content';
import { Order } from '@src/schemas/order/order.schema';
import { BeOrderDto } from '../dto/beOrder.dto';
import { Product } from '@src/schemas/product/product.schema';
import { EmailService } from '@src/common/email/email.service';

const moment = require('moment');
@Injectable()
export class OrderService {
   constructor(
      @InjectModel(Order.name) private order: PaginateModel<Order>,
      @InjectModel(Product.name) private product: PaginateModel<Product>,
      @InjectModel(Customer.name) private customer: PaginateModel<Customer>,
      private helper: HelperService,
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

      if (isNotEmpty(query.username)) {
         let customer = await this.customer.findOne({ username: query.username });
         if (customer)
            conditions['customer'] = {
               $in: [customer._id],
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
         const result = this.order.find(conditions).sort(sort).select(projection).populate('product').populate('customer');
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.order.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
            populate: [
               {
                  path: 'product',
                  populate: 'category',
               },
               'customer',
            ],
         });
      }
   }
   async findAllFe(query: Record<string, any>, customer: Customer): Promise<any> {
      const conditions = {};
      conditions['deletedAt'] = null;
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
         const result = this.order.find(conditions).sort(sort).select(projection).populate('product');
         return isNaN(get) ? result : result.limit(get);
      } else {
         return this.order.paginate(conditions, {
            select: projection,
            page: query.page,
            limit: query.limit,
            sort: sort,
            populate: [
               {
                  path: 'product',
                  populate: 'category',
               },
            ],
         });
      }
   }

   async findOne(query: Record<string, any>): Promise<Order> {
      return this.order.findOne(query);
   }

   async create(data: BeOrderDto): Promise<Order | boolean> {
      let validCustomer = await this.validCustomer(data);
      if (!validCustomer.status) this.helper.throwException(validCustomer.msg);

      let validProduct = await this.validProduct(data);
      if (!validProduct.status) this.helper.throwException(validProduct.msg);

      await this.customer.findOneAndUpdate({ _id: data.customer }, { $inc: { balance: -validProduct.data.price } });

      try {
         const item = await new this.order({ ...data, price: validProduct?.data?.price }).save();
         this.emailService.newOrder(
            validCustomer?.data?.email,
            validCustomer?.data?.username,
            validProduct?.data?.name,
            validProduct?.data?.category?.name,
            validProduct?.data?.price,
         );
         return item;
      } catch (error) {
         await this.processAfterError(data);
         return false;
      }
   }
   async processAfterError(data: BeOrderDto) {
      let product = await this.product.findOneAndUpdate({ _id: data.product }, { $inc: { quantity: data.quantity } });
      await this.customer.findOneAndUpdate(
         { _id: data.customer },
         {
            $inc: { balance: product.price },
         },
      );
   }
   async validCustomer(data: BeOrderDto) {
      let product = await this.product.findById(data.product);
      let customer = await this.customer.findOne({ _id: data.customer, balance: { $gte: product.price } });
      if (customer) {
         return {
            status: true,
            msg: 'valid',
            data: customer,
         };
      } else {
         return {
            status: false,
            msg: `To use our services, deposit funds by selecting a payment method, Your funds will appear in your account within minutes`,
         };
      }
   }
   async validProduct(data: BeOrderDto) {
      let product = await this.product
         .findOneAndUpdate(
            {
               _id: data.product,
               quantity: { $gte: data.quantity },
            },
            {
               $inc: {
                  quantity: -data.quantity,
               },
            },
         )
         .populate('category');
      return product
         ? {
            status: true,
            msg: 'OK',
            data: product,
         }
         : {
            status: false,
            msg: 'Quantity is not enough!',
         };
   }

   async update(id: string, data: BeOrderDto): Promise<Order> {
      const item = await this.order.findByIdAndUpdate(id, data, { returnOriginal: false });
      return item;
   }

   async deletes(ids: Array<string>): Promise<any> {
      return this.order.updateMany({ _id: { $in: ids } }, { deletedAt: new Date() });
   }

   async detail(id: string): Promise<Order> {
      return this.order.findById(id);
   }
   // async findBySlug(slug: string): Promise<Order> {
   //    return this.order.findOne({ slug });
   // }
}

