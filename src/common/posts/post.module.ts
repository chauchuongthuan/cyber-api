import { Module } from '@nestjs/common';
import { BePostController } from './admin/bePost.controller';
import { FePostController } from './frontend/fePost.controller';
import { PostService } from './services/post.service';
import { TransformerPostService } from './services/transformerPost.service';
import { SchemasModule } from '@schemas/schemas.module';
import { ActivityModule } from '../activities/activity.module';

@Module({
   imports: [SchemasModule, ActivityModule],
   controllers: [BePostController, FePostController],
   providers: [PostService, TransformerPostService],
   exports: [PostService, TransformerPostService],
})
export class PostModule {}
