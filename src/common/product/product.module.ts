import { Module } from '@nestjs/common';
import { SchemasModule } from '@schemas/schemas.module';
import { ActivityModule } from '@common/activities/activity.module';
import { BeProductController } from './admin/beProduct.controller';
import { ProductService } from './services/product.service';
import { TransformerProductService } from './services/transformerProduct.service';
import { FeProductController } from './frontend/feProduct.controller';

@Module({
   imports: [SchemasModule, ActivityModule],
   controllers: [BeProductController, FeProductController],
   providers: [ProductService, TransformerProductService],
   exports: [ProductService, TransformerProductService],
})
export class ProductModule {}
