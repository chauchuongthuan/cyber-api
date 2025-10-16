import { Body, Controller, Get, Param, Post, Put, Delete, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ResponseService } from '@core/services/response.service';
import { HelperService } from '@core/services/helper.service';
import { BePostDto } from './dto/bePost.dto';
import { PostService } from '../services/post.service';
import { TransformerPostService } from '../services/transformerPost.service';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { UserSecure } from '@src/common/auth/user/decorators/userSecure.decorator';
import { ACL } from '@common/auth/decorators/acl.decorator';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { HasFile } from '@core/decorators/hasFile.decorator';
import { Permissions } from '@core/services/permission.service';
import { DefaultListQuery } from '@core/decorators/defaultListQuery.decorator';
import { ActivityInterceptor } from '@core/interceptors/activity.interceptor';
@ApiTags('Admin/Post')
@Controller('admin/posts')
@UseInterceptors(CoreTransformInterceptor, ActivityInterceptor)
@UserSecure()
export class BePostController {
   constructor(
      private post: PostService,
      private transformer: TransformerPostService,
      private response: ResponseService,
      private helper: HelperService,
   ) { }

   @Get()
   @ACL(Permissions.post_list)
   @DefaultListQuery()
   async findAll(@Query() query: Record<string, any>): Promise<any> {
      const items = await this.post.findAll(query);
      if (query.export && query.get) return this.transformer.transformPostExport(items);
      return this.response.fetchListSuccess(this.transformer.transformPostList(items));
   }

   @Get(':id')
   @ACL(Permissions.post_detail)
   async findById(@Param('id') id: string): Promise<any> {
      const item = await this.post.findById(id);
      if (!item) return this.response.detailFail();
      return this.response.detailSuccess(this.transformer.transformPostDetail(item));
   }

   @Post()
   @ACL(Permissions.post_add)
   @HasFile()
   async add(@UploadedFiles() files, @Body() dto: BePostDto): Promise<any> {
      const item = await this.post.create(dto, files);
      if (!item) return this.response.createdFail();
      return this.response.createdSuccess(this.transformer.transformPostDetail(item));
   }

   @Put(':id')
   @ACL(Permissions.post_edit)
   @HasFile()
   async edit(@UploadedFiles() files, @Param('id') id: string, @Body() dto: BePostDto): Promise<any> {
      const item = await this.post.update(id, dto, files);
      if (!item) return this.response.updatedFail();
      return this.response.updatedSuccess(this.transformer.transformPostDetail(item));
   }

   @Delete()
   @ACL(Permissions.post_delete)
   async deletes(@Body('ids') ids: Array<string>): Promise<any> {
      const items = await this.post.deleteManyById(ids);
      if (!items) return this.response.deletedFail();
      return this.response.deletedSuccess();
   }
}
