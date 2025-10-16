import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './common/auth/auth.module';
import { UserModule } from './common/users/user.module';
import { RolesModule } from './common/roles/roles.module';
import { CustomerModule } from './common/customer/customer.module';
import { CoresModule } from './core/core.module';
import { SchemasModule } from './schemas/schemas.module';
import { PageModule } from './common/page/page.module';
import { SettingModule } from './common/setting/setting.module';
import { CategoryModule } from './common/category/category.module';
import { AuthorModule } from './common/author/author.module';
import { StoryModule } from './common/story/story.module';
import { PostModule } from './common/posts/post.module';
import { ContactModule } from './common/contact/contact.module';
import { SubscriberModule } from './common/subscriber/subscriber.module';
import { UploadModule } from './common/upload/upload.module';
import { CustomerCareModule } from './common/customerCare/customerCare.module';
import { tokenDrawModule } from './common/tokenDraw/tokenDraw.module';
import { QueueModule } from './common/queues/queues.module';
import { ProductModule } from './common/product/product.module';
import { PaymentModule } from './common/payment/payment.module';
import { OrderModule } from './common/order/order.module';
import { EmailModule } from './common/email/email.module';

const queueDriver = process.env.QUEUE_DRIVER;

const imports = [
   CoresModule,
   SchemasModule,
   AuthModule,
   UserModule,
   RolesModule,
   CustomerModule,
   // PageModule,
   SettingModule,
   CategoryModule,
   // AuthorModule,
   // StoryModule,
   PostModule,
   // ContactModule,
   SubscriberModule,
   UploadModule,
   ProductModule,
   PaymentModule,
   OrderModule,
   EmailModule,
   // CustomerCareModule,
   // tokenDrawModule,
];

if (queueDriver === 'redis') {
   imports.push(QueueModule);
}

@Module({
   imports: imports,
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
