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
import { ResponseService } from '@core/services/response.service';
import { UserSecure } from '@common/auth/user/decorators/userSecure.decorator';
import { HasFile } from '@core/decorators/hasFile.decorator';
import { ApiBody, ApiTags, ApiHeader } from '@nestjs/swagger';
import { ActivityInterceptor } from '@core/interceptors/activity.interceptor';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { DefaultListQuery } from '@core/decorators/defaultListQuery.decorator';
import { ProductService } from '../services/product.service';
import { TransformerProductService } from '../services/transformerProduct.service';
import { ACL } from '@src/common/auth/decorators/acl.decorator';
import { Permissions } from '@src/core/services/permission.service';
import { BeProductDto } from '../dto/beProduct.dto';

@ApiTags('Admin/Product')
@Controller('admin/products')
@UserSecure()
@UseInterceptors(CoreTransformInterceptor, ActivityInterceptor)
export class BeProductController {
   constructor(
      private productService: ProductService,
      private transformer: TransformerProductService,
      private response: ResponseService,
   ) {}

   // Find list categories
   @Get()
   @ACL(Permissions.product_list)
   @DefaultListQuery()
   async findAll(@Query() query: Record<string, any>): Promise<any> {
      const items = await this.productService.findAll(query);
      if (query.get && query.export) return this.transformer.transformProductExport(items);
      return this.response.fetchListSuccess(await this.transformer.transformProductList(items));
   }

   // Create a new product

   @Post()
   @ACL(Permissions.product_edit)
   @HasFile()
   async create(@UploadedFiles() files, @Body() dto: BeProductDto): Promise<any> {
      const item = await this.productService.create(dto, files);
      if (!item) return this.response.createdFail();
      return this.response.createdSuccess(await this.transformer.transformProductDetail(item));
   }

   // Update product

   @Put(':id')
   @ACL(Permissions.product_edit)
   @HasFile()
   async update(@UploadedFiles() files, @Param('id') id: string, @Body() dto: BeProductDto): Promise<any> {
      const item = await this.productService.update(id, dto, files);
      if (!item) return this.response.updatedFail();
      return this.response.updatedSuccess(await this.transformer.transformProductDetail(item));
   }

   // Delete product

   @Delete()
   @ACL(Permissions.product_delete)
   async deletes(@Body('ids') ids: Array<string>): Promise<any> {
      const item = await this.productService.deletes(ids);
      if (!item) return this.response.deletedFail();
      return this.response.deletedSuccess();
   }

   // Get product by Id

   @Get(':id')
   @ACL(Permissions.product_detail)
   async getById(@Param('id') id: string): Promise<any> {
      const product = await this.productService.detail(id);
      if (!product) return this.response.detailFail();
      return this.response.detailSuccess(await this.transformer.transformProductDetail(product));
   }
}

