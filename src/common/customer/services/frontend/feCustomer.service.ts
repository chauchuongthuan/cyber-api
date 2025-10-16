import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from '@src/common/email/email.service';
import { convertContentFileDto, saveThumbOrPhotos } from '@src/core/helpers/content';
import { HelperService } from '@src/core/services/helper.service';
import { Customer } from '@src/schemas/customer/customer.schemas';
import { PaginateModel } from 'mongoose';

@Injectable()
export class feCustomerService {
   constructor(
      @Inject(REQUEST) private request: any,
      @InjectModel(Customer.name) private customerModel: PaginateModel<Customer>,
      private helperService: HelperService,
      private emailService: EmailService,
   ) { }

   async detail(id: string): Promise<any> {
      return this.customerModel.findOne({ _id: id });
   }

   async create(data: object): Promise<{ status: boolean; message?: string; data?: any }> {
      try {
         if (data['password']) data['password'] = await this.helperService.hash(data['password']);
         const item = await new this.customerModel(data).save();
         // if (item) {
         //    this.emailService.newCustomer(item.email, item.username);
         // }
         return { status: true, data: item };
      } catch (error) {
         const rs = { status: false, message: 'Create failure!' };
         if (error.code == 11000) {
            const fields = Object.keys(error.keyPattern);
            if (fields.includes('email')) rs.message = 'Email is exist!';
            if (fields.includes('username')) rs.message = 'Username is exist!';
         }
         return rs;
      }
   }

   async update(id: string, data: object, files: any): Promise<Customer> {
      console.log(`data---->`, data);
      const item = await this.customerModel.findOneAndUpdate({ _id: id }, data, { returnOriginal: false });
      console.log(`item---->`, item);
      return item;
   }

   async updateProfileImage(id: string, data: object, files: any): Promise<Customer> {
      await convertContentFileDto(data, files, ['profileImage']);
      const item = await this.customerModel.findOneAndUpdate({ _id: id }, data, { new: true });
      if (item) await saveThumbOrPhotos(item);
      return item;
   }

   async findOneByConditions(conditions: object) {
      return this.customerModel.findOne(conditions);
   }
}
