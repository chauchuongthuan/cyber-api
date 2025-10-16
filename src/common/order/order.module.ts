import { Module } from '@nestjs/common';
import { SchemasModule } from '@schemas/schemas.module';
import { ActivityModule } from '@common/activities/activity.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BeOrderController } from './admin/beOrder.controller';
import { OrderService } from './services/order.service';
import { TransformerOrderService } from './services/transformerOrder.service';
import { FeOrderController } from './frontend/feOrder.controller';
import { EmailService } from '../email/email.service';
import { TransformerProductService } from '../product/services/transformerProduct.service';

@Module({
   imports: [SchemasModule, ActivityModule],
   controllers: [BeOrderController, FeOrderController],
   providers: [OrderService, TransformerOrderService, EmailService, TransformerProductService],
   exports: [OrderService, TransformerOrderService, EmailService, TransformerProductService],
})
export class OrderModule {}

