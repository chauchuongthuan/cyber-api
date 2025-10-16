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
import { CategoryService } from '../services/category.service';
import { TransformerCategoryService } from '../services/transformerCategory.service';
import { ACL } from '@src/common/auth/decorators/acl.decorator';
import { Permissions } from '@src/core/services/permission.service';
import { BeCategoryDto } from '../dto/beCategory.dto';

@ApiTags('Admin/Category')
@Controller('admin/categories')
@UserSecure()
@UseInterceptors(CoreTransformInterceptor, ActivityInterceptor)
export class BeCategoryController {
   constructor(
      private categoryService: CategoryService,
      private transformer: TransformerCategoryService,
      private response: ResponseService,
   ) {}

   // Find list categories
   @Get()
   @DefaultListQuery()
   @ACL(Permissions.product_list)
   async findAll(@Query() query: Record<string, any>): Promise<any> {
      const items = await this.categoryService.findAll(query);
      if (query.get && query.export) return this.transformer.transformCategoryExport(items);
      return this.response.fetchListSuccess(this.transformer.transformCategoryList(items));
   }

   // Create a new category

   @Post()
   @ACL(Permissions.product_edit)
   @HasFile()
   async create(@Body() dto: BeCategoryDto): Promise<any> {
      const item = await this.categoryService.create(dto);
      if (!item) return this.response.createdFail();
      return this.response.createdSuccess(await this.transformer.transformCategoryDetail(item));
   }

   // Update category

   @Put(':id')
   @ACL(Permissions.product_edit)
   @HasFile()
   async update(@Param('id') id: string, @Body() dto: BeCategoryDto): Promise<any> {
      const item = await this.categoryService.update(id, dto);
      if (!item) return this.response.updatedFail();
      return this.response.updatedSuccess(await this.transformer.transformCategoryDetail(item));
   }

   // Delete category

   @Delete()
   @ACL(Permissions.product_delete)
   async deletes(@Body('ids') ids: Array<string>): Promise<any> {
      const item = await this.categoryService.deletes(ids);
      if (!item) return this.response.deletedFail();
      return this.response.deletedSuccess();
   }

   // Get category by Id

   @Get(':id')
   @ACL(Permissions.product_detail)
   async getById(@Param('id') id: string): Promise<any> {
      const category = await this.categoryService.detail(id);
      if (!category) return this.response.detailFail();
      return this.response.detailSuccess(await this.transformer.transformCategoryDetail(category));
   }
}
