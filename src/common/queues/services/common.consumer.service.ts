import { Job } from 'bull';
import { Processor, Process } from '@nestjs/bull';
import { HelperService } from '@src/core/services/helper.service';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Customer } from '@src/schemas/customer/customer.schemas';
import { TokenDrawService } from '@src/common/tokenDraw/services/tokenDraw.service';
import { TokenDraw } from '@src/schemas/tokenDraw/tokenDraw';
var ObjectID = require('mongodb').ObjectID;
@Processor('common')
export class CommonConsumerService {
   constructor(private helperService: HelperService, @InjectModel(TokenDraw.name) private tokenDraw: PaginateModel<TokenDraw>) {}

   @Process('importTokenDraw')
   async importTokenDraw(job: Job<unknown>): Promise<any> {
      console.log('Go import');
      const data = job.data as any;
      const newData = [];
      let count = 0;
      let i = 0;

      for (let index = 0; index < data.length; index++) {
         const row = data[index];
         console.log(index);
         count++;
         if (!newData[i]) newData[i] = [];
         newData[i].push({
            name: row?.name || null,
            nameNon: this.helperService.translateZoneNameVietnamese(row?.name),
            active: true,
            token: row.token,
            isWin: false,
            winDate: null,
         });
         if (count == 1000) {
            i++;
            count = 0;
         }
      }

      console.log('newData', newData[0].length);

      for (let index = 0; index < newData[0].length; index++) {
         const d = newData[0][index];
         console.log(index);
         console.log('d', d);
         try {
            const result = await new this.tokenDraw(d).save();
            // await this.customer.updateMany({}, [{$set: {avatar:  { "$concat": ["$noSale",".png"]}}}])
         } catch (error) {
            console.log(`LOG ERORR: ${error}`);
         }
      }

      console.log('DONE');
   }
}
