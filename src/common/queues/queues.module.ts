import { forwardRef, Module } from '@nestjs/common';
import { SchemasModule } from '@schemas/schemas.module';
import { BullModule } from '@nestjs/bull';
import { tokenDrawModule } from '../tokenDraw/tokenDraw.module';
import { CommonConsumerService } from './services/common.consumer.service';
import { CommonProducerService } from './services/common.producer.service';

@Module({
   imports: [
      SchemasModule,
      forwardRef(() => tokenDrawModule),
      BullModule.forRootAsync({
         useFactory: () => ({
            redis: {
               host: process.env.REDIS_HOST,
               port: parseInt(process.env.REDIS_PORT),
               username: process.env.REDIS_USERNAME,
               password: process.env.REDIS_PASSWORD,
               keyPrefix: `queue${process.env.REDIS_PREFIX}`,
            },
         }),
         inject: [],
      }),
      BullModule.registerQueue({ name: 'common' }),
   ],
   controllers: [],
   providers: [CommonProducerService, CommonConsumerService],
   exports: [CommonProducerService, CommonConsumerService],
})
export class QueueModule {}
