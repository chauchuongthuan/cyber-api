import { Module } from '@nestjs/common';
import { SchemasModule } from '@schemas/schemas.module';
import { ActivityModule } from '@common/activities/activity.module';
import { BePaymentController } from './admin/bePayment.controller';
import { PaymentService } from './services/payment.service';
import { TransformerPaymentService } from './services/transformerPayment.service';
import { FePaymentController } from './frontend/fePayment.controller';
import { EmailService } from '../email/email.service';

@Module({
   imports: [SchemasModule, ActivityModule],
   controllers: [BePaymentController, FePaymentController],
   providers: [PaymentService, TransformerPaymentService, EmailService],
   exports: [PaymentService, TransformerPaymentService, EmailService],
})
export class PaymentModule {}
