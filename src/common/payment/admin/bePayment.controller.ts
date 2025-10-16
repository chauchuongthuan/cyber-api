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
import { PaymentService } from '../services/payment.service';
import { TransformerPaymentService } from '../services/transformerPayment.service';
import { ACL } from '@src/common/auth/decorators/acl.decorator';
import { Permissions } from '@src/core/services/permission.service';
import { BePaymentDto } from '../dto/bePayment.dto';

@ApiTags('Admin/Payment')
@Controller('admin/payment')
@UserSecure()
@UseInterceptors(CoreTransformInterceptor, ActivityInterceptor)
export class BePaymentController {
   constructor(
      private paymentService: PaymentService,
      private transformer: TransformerPaymentService,
      private response: ResponseService,
   ) {}

   // Find list categories
   @Get()
   @DefaultListQuery()
   @ACL(Permissions.payment_list)
   async findAll(@Query() query: Record<string, any>): Promise<any> {
      const items = await this.paymentService.findAll(query);
      if (query.get && query.export) return this.transformer.transformPaymentExport(items);
      return this.response.fetchListSuccess(this.transformer.transformPaymentList(items));
   }

   // Create a new payment

   @Post()
   @ACL(Permissions.payment_edit)
   @HasFile()
   async create(@Body() dto: BePaymentDto): Promise<any> {
      const item = await this.paymentService.create(dto);
      if (!item) return this.response.createdFail();
      return this.response.createdSuccess(await this.transformer.transformPaymentDetail(item));
   }

   // Update payment

   @Put(':id')
   @ACL(Permissions.payment_edit)
   @HasFile()
   async update(@Param('id') id: string, @Body() dto: BePaymentDto): Promise<any> {
      const item = await this.paymentService.update(id, dto);
      if (!item) return this.response.updatedFail();
      return this.response.updatedSuccess(await this.transformer.transformPaymentDetail(item));
   }

   // Delete payment

   @Delete()
   @ACL(Permissions.payment_delete)
   async deletes(@Body('ids') ids: Array<string>): Promise<any> {
      const item = await this.paymentService.deletes(ids);
      if (!item) return this.response.deletedFail();
      return this.response.deletedSuccess();
   }

   // Get payment by Id

   @Get(':id')
   @ACL(Permissions.payment_detail)
   async getById(@Param('id') id: string): Promise<any> {
      const payment = await this.paymentService.detail(id);
      if (!payment) return this.response.detailFail();
      return this.response.detailSuccess(await this.transformer.transformPaymentDetail(payment));
   }
}
