import {
   Body,
   Controller,
   Get,
   Post,
   Put,
   Delete,
   Request,
   UseInterceptors,
   UploadedFiles,
   Param,
   Query,
   UseGuards,
} from '@nestjs/common';
import { TransformerCustomerService } from '@common/customer/services/transformerCustomer.service';
import { ResponseService } from '@core/services/response.service';
import { UserSecure } from '@common/auth/user/decorators/userSecure.decorator';
import { HasFile } from '@core/decorators/hasFile.decorator';
import { ApiBody, ApiTags, ApiHeader } from '@nestjs/swagger';
import { ActivityInterceptor } from '@core/interceptors/activity.interceptor';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { DefaultListQuery } from '@core/decorators/defaultListQuery.decorator';
import { OrderService } from '../services/order.service';
import { TransformerOrderService } from '../services/transformerOrder.service';
import { ACL } from '@src/common/auth/decorators/acl.decorator';
import { Permissions } from '@src/core/services/permission.service';
import { BeOrderDto } from '../dto/beOrder.dto';

@ApiTags('Admin/Order')
@Controller('admin/orders')
@UserSecure()
@UseInterceptors(CoreTransformInterceptor, ActivityInterceptor)
export class BeOrderController {
   constructor(
      private orderService: OrderService,
      private transformer: TransformerOrderService,
      private response: ResponseService,
   ) {}

   // Find list categories
   @Get()
   @DefaultListQuery()
   @ACL(Permissions.order_list)
   async findAll(@Query() query: Record<string, any>): Promise<any> {
      const items = await this.orderService.findAll(query);
      if (query.get && query.export) return this.transformer.transformOrderExport(items);
      return this.response.fetchListSuccess(await this.transformer.transformOrderList(items));
   }

   // Create a new order

   @Post()
   @ACL(Permissions.order_edit)
   @HasFile()
   async create(@Body() dto: BeOrderDto): Promise<any> {
      const item = await this.orderService.create(dto);
      if (!item) return this.response.createdFail();
      return this.response.createdSuccess(await this.transformer.transformOrderDetail(item));
   }

   // Update order

   // @Put(':id')
   // @ACL(Permissions.order_edit)
   // @HasFile()
   // async update(@Param('id') id: string, @Body() dto: BeOrderDto): Promise<any> {
   //    const item = await this.orderService.update(id, dto);
   //    if (!item) return this.response.updatedFail();
   //    return this.response.updatedSuccess(await this.transformer.transformOrderDetail(item));
   // }

   // Delete order

   @Delete()
   @ACL(Permissions.order_delete)
   async deletes(@Body('ids') ids: Array<string>): Promise<any> {
      const item = await this.orderService.deletes(ids);
      if (!item) return this.response.deletedFail();
      return this.response.deletedSuccess();
   }

   // Get order by Id

   @Get(':id')
   @ACL(Permissions.order_detail)
   async getById(@Param('id') id: string): Promise<any> {
      const order = await this.orderService.detail(id);
      if (!order) return this.response.detailFail();
      return this.response.detailSuccess(await this.transformer.transformOrderDetail(order));
   }
}

