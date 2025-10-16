import { Controller, Get, Query, Param, UseInterceptors, applyDecorators, Body, Post } from '@nestjs/common';
import { ResponseService } from '@core/services/response.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { DefaultListQuery } from '@src/core/decorators/defaultListQuery.decorator';
import { OrderService } from '../services/order.service';
import { TransformerOrderService } from '../services/transformerOrder.service';
import { CustomerSecure } from '@src/common/auth/customer/decorators/customerSecure.decorator';
import { Customer } from '@src/schemas/customer/customer.schemas';
import { CustomerAuth } from '@src/common/auth/customer/decorators/customer.decorator';
import { HasFile } from '@src/core/decorators/hasFile.decorator';
import { BeOrderDto } from '../dto/beOrder.dto';
@ApiTags('Frontend/Order')
@Controller('orders')
@UseInterceptors(CoreTransformInterceptor)
export class FeOrderController {
   constructor(private order: OrderService, private transformer: TransformerOrderService, private response: ResponseService) {}

   @Get()
   @CustomerSecure()
   @DefaultListQuery()
   async findAll(@Query() query: Record<string, any>, @CustomerAuth() customer: Customer): Promise<any> {
      const items = await this.order.findAllFe(query, customer);
      return this.response.fetchListSuccess(await this.transformer.transformOrderList(items));
   }

   @Post()
   @CustomerSecure()
   @HasFile()
   async create(@Body() dto: BeOrderDto, @CustomerAuth() customer: Customer): Promise<any> {
      const item = await this.order.create({ ...dto, customer: customer.id });
      if (!item) return this.response.createdFail();
      return this.response.createdSuccess(await this.transformer.transformOrderDetail(item));
   }

   @Get(':id')
   @CustomerSecure()
   async findById(@Param('id') id: string): Promise<any> {
      const item = await this.order.detail(id);
      if (!item) return this.response.detailFail();
      return this.response.detailSuccess(await this.transformer.transformOrderDetail(item));
   }
}

