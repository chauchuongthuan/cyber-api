import { Controller, Get, Query, Param, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ResponseService } from '@core/services/response.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { DefaultListQuery } from '@src/core/decorators/defaultListQuery.decorator';
import { CategoryService } from '../services/category.service';
import { TransformerCategoryService } from '../services/transformerCategory.service';
@ApiTags('Frontend/Category')
@Controller('categories')
@UseInterceptors(CoreTransformInterceptor)
export class FeCategoryController {
   constructor(
      private category: CategoryService,
      private transformer: TransformerCategoryService,
      private response: ResponseService,
   ) {}

   @Get()
   @DefaultListQuery()
   async findAll(@Query() query: Record<string, any>): Promise<any> {
      const items = await this.category.findAll(query, true);
      return this.response.fetchListSuccess(this.transformer.transformCategoryList(items));
   }

   @Get(':slug')
   async findById(@Param('slug') slug: string): Promise<any> {
      const item = await this.category.findBySlug(slug);
      if (!item) return this.response.detailFail();
      return this.response.detailSuccess(this.transformer.transformCategoryDetail(item));
   }
}
