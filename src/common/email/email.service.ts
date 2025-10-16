import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting } from '@src/schemas/setting.schemas';
import { PaginateModel } from 'mongoose';

@Injectable()
export class EmailService {
   constructor(
      private readonly mailerService: MailerService,
      @InjectModel(Setting.name) private setting: PaginateModel<Setting>,
   ) {}

   private async setTransport(user: any, pass: any) {
      const config = {
         host: 'smtp.gmail.com',
         port: 465,
         secure: true,
         auth: { user, pass },
      };

      this.mailerService.addTransporter('gmail', config);
   }

   public async newCustomer(toEmail: string, username: string) {
      let [user, pass] = await Promise.all([this.setting.findOne({ name: 'email' }), this.setting.findOne({ name: 'appPass' })]);
      let email = user?.value;
      let appPass = pass?.value;

      if (email && appPass) {
         await this.setTransport(email, appPass);

         let options = {
            transporterName: 'gmail',
            from: email, // sender address

            to: email, // list of receivers
            subject: 'New Customer', // Subject line
            template: 'newCustomer',
            context: { username, email: toEmail },
         };

         this.mailerService.sendMail(options).catch((err) => {
            console.log(err);
         });
      }
   }
   public async newOrder(toEmail: string, username: string, productName: string, category: string, price: number) {
      let [user, pass] = await Promise.all([this.setting.findOne({ name: 'email' }), this.setting.findOne({ name: 'appPass' })]);
      let email = user?.value;
      let appPass = pass?.value;

      if (email && appPass) {
         await this.setTransport(email, appPass);

         let options = {
            transporterName: 'gmail',
            from: email, // sender address

            to: email, // list of receivers
            subject: 'Order', // Subject line
            template: 'newOrder',
            context: { username, email: toEmail, productName, category, price },
         };

         this.mailerService.sendMail(options).catch((err) => {
            console.log(err);
         });
      }
   }
   public async newPayment(toEmail: string, username: string, usd: string, type: string, coin: number) {
      let [user, pass] = await Promise.all([this.setting.findOne({ name: 'email' }), this.setting.findOne({ name: 'appPass' })]);
      let email = user?.value;
      let appPass = pass?.value;

      if (email && appPass) {
         await this.setTransport(email, appPass);

         let options = {
            transporterName: 'gmail',
            from: email, // sender address

            to: email, // list of receivers
            subject: 'Payment', // Subject line
            template: 'newPayment',
            context: { username, email: toEmail, usd, type, coin },
         };

         this.mailerService.sendMail(options).catch((err) => {
            console.log(err);
         });
      }
   }
}
