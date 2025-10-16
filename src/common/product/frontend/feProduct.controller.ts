import { Controller, Get, Query, Param, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ResponseService } from '@core/services/response.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { DefaultListQuery } from '@src/core/decorators/defaultListQuery.decorator';
import { ProductService } from '../services/product.service';
import { TransformerProductService } from '../services/transformerProduct.service';
@ApiTags('Frontend/Product')
@Controller('products')
@UseInterceptors(CoreTransformInterceptor)
export class FeProductController {
   constructor(
      private product: ProductService,
      private transformer: TransformerProductService,
      private response: ResponseService,
   ) { }

   @Get()
   @DefaultListQuery()
   async findAll(@Query() query: Record<string, any>): Promise<any> {
      const items = await this.product.findAll(query, true);
      return this.response.fetchListSuccess(await this.transformer.transformProductList(items));
   }

   @Get('product-by-category')
   @DefaultListQuery()
   async productByCategory(): Promise<any> {
      const items = await this.product.productByCategory();
      return this.response.fetchListSuccess(items);
   }

   @Get(':slug')
   async findById(@Param('slug') slug: string): Promise<any> {
      const item = await this.product.findBySlug(slug);
      if (!item) return this.response.detailFail();
      return this.response.detailSuccess(await this.transformer.transformProductDetail(item));
   }

   
}

