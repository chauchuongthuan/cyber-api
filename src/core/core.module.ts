import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod, CacheModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from '@common/auth/auth.module';
import { FastJwtService } from './services/fastJwt.service';
import { HelperService } from './services/helper.service';
import { PermissionService } from './services/permission.service';
import { ResponseService } from './services/response.service';
import { JwtUserMiddleware } from './middlewares/jwtUser.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivityModule } from '@common/activities/activity.module';
import { ExportService } from '@core/services/export.service';
import { FbGraphService } from '@core/services/fbGraph.service';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';
import configuration from './config/configuration';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { JwtCustomerMiddleware } from './middlewares/jwtCustomer.middleware';

@Global()
@Module({
   imports: [
      AuthModule,
      ActivityModule,
      ConfigModule.forRoot({
         envFilePath: ['.env'],
         load: [configuration],
         isGlobal: true,
         expandVariables: true,
      }),
      ServeStaticModule.forRoot({
         rootPath: join(__dirname, '../../'),
         serveRoot: '',
      }),
      ScheduleModule.forRoot(),
   ],

   providers: [HelperService, ResponseService, FastJwtService, PermissionService, ExportService, FbGraphService],

   exports: [HelperService, ResponseService, FastJwtService, PermissionService, ExportService, FbGraphService],
})
export class CoresModule implements NestModule {
   /**
    * Global Middleware
    * @param consumer
    */
   configure(consumer: MiddlewareConsumer): any {
      /*
       * Common middleware:
       * - Helmet: Security http headers
       * - Compression: Gzip, deflate
       * - Rate limiting
       */
      consumer
         .apply(
            helmet(),
            compression(),
            rateLimit({
               windowMs: 60000, // 1s to reset limit
               max: 600, // limit each IP to 10 requests per windowMs
            }),
            LoggerMiddleware,
         )
         .forRoutes({ path: '*', method: RequestMethod.ALL });

      /*
       * Recaptcha
       */
      // consumer.apply(ReCaptchaMiddleware)
      //     .forRoutes(
      //         // { path: 'auth/customers/login', method: RequestMethod.ALL },
      //         // { path: 'auth/customers/register', method: RequestMethod.ALL },
      //         // { path: 'auth/customers/forgot-password', method: RequestMethod.ALL },
      //         // { path: 'subscribers', method: RequestMethod.ALL },
      //     );
      // /*
      //  * End common middleware
      //  */

      // /*
      //  * JWT validate
      //  */
      consumer
         .apply(JwtCustomerMiddleware)
         .exclude({ path: 'auth/customers/login', method: RequestMethod.ALL })
         .forRoutes(
            { path: 'auth/customers/logout', method: RequestMethod.ALL },
            { path: 'orders*', method: RequestMethod.ALL },
            { path: 'subscribers*', method: RequestMethod.ALL },
            { path: 'payment/', method: RequestMethod.GET },
            { path: 'payment/', method: RequestMethod.POST },
            { path: 'auth/customers/profiles', method: RequestMethod.ALL },
            { path: 'auth/customers/profile-image', method: RequestMethod.ALL },
            { path: 'auth/customers/change-password', method: RequestMethod.ALL },
            { path: 'auth/customers/update-password', method: RequestMethod.ALL },
         );
      consumer
         .apply(JwtUserMiddleware)
         .exclude({ path: 'auth/users/login', method: RequestMethod.ALL })
         .forRoutes(
            { path: 'admin*', method: RequestMethod.ALL },
            { path: 'auth/users/logout', method: RequestMethod.ALL },
            { path: 'auth/users/profiles', method: RequestMethod.ALL },
            { path: 'admin/category', method: RequestMethod.ALL },
         );
   }
}
