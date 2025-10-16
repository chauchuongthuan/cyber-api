import { Controller, Get, Query, Param, UseInterceptors, applyDecorators, Body, Post, Delete } from '@nestjs/common';
import { ResponseService } from '@core/services/response.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { DefaultListQuery } from '@src/core/decorators/defaultListQuery.decorator';
import { PaymentService } from '../services/payment.service';
import { TransformerPaymentService } from '../services/transformerPayment.service';
import { CustomerSecure } from '@src/common/auth/customer/decorators/customerSecure.decorator';
import { Customer } from '@src/schemas/customer/customer.schemas';
import { CustomerAuth } from '@src/common/auth/customer/decorators/customer.decorator';
import { HasFile } from '@src/core/decorators/hasFile.decorator';
import { BePaymentDto } from '../dto/bePayment.dto';
@ApiTags('Frontend/Payment')
@Controller('payment')
@UseInterceptors(CoreTransformInterceptor)
export class FePaymentController {
   constructor(
      private payment: PaymentService,
      private transformer: TransformerPaymentService,
      private response: ResponseService,
   ) {}

   @Get()
   @CustomerSecure()
   @DefaultListQuery()
   async findAll(@Query() query: Record<string, any>, @CustomerAuth() customer: Customer): Promise<any> {
      const items = await this.payment.findAllFe(query, customer);
      return this.response.fetchListSuccess(this.transformer.transformPaymentList(items, {}, true));
   }

   @Post()
   @CustomerSecure()
   @HasFile()
   async create(@Body() dto: BePaymentDto, @CustomerAuth() customer: Customer): Promise<any> {
      const item = await this.payment.create({ ...dto, customer: customer.id });
      if (!item) return this.response.createdFail();
      return this.response.createdSuccess(await this.transformer.transformPaymentDetail(item.data, { key: item.key }));
   }
   @Post('success/:id')
   @HasFile()
   async success(@Body() dto: { key: string }, @Param('id') id: string): Promise<any> {
      let item = await this.payment.successPayment(id, dto);
      return this.response.updatedSuccess(item);
   }
   @Post('cancel/:id')
   @HasFile()
   async cancel(@Param('id') id: string): Promise<any> {
      await this.payment.cancelPayment(id);
      return this.response.updatedSuccess();
   }

   @Get(':id')
   @CustomerSecure()
   async findById(@Param('id') id: string): Promise<any> {
      const item = await this.payment.detail(id);
      if (!item) return this.response.detailFail();
      return this.response.detailSuccess(this.transformer.transformPaymentDetail(item));
   }

   @Delete('delete-fe')
   async deletesFe(@Body('ids') ids: Array<string>): Promise<any> {
      const item = await this.payment.deletesFe(ids);
      if (!item) return this.response.deletedFail();
      return this.response.deletedSuccess();
   }
   @Delete()
   async deletes(@Body('ids') ids: Array<string>): Promise<any> {
      const item = await this.payment.deletes(ids);
      if (!item) return this.response.deletedFail();
      return this.response.deletedSuccess();
   }
}
