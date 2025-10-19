import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthModule } from './common/auth/auth.module';
import { json, urlencoded } from 'body-parser';
import { UserAuthModule } from './common/auth/user/user.module';
import { ValidationPipe } from '@nestjs/common';
const fs = require('fs');
const bodyParser = require('body-parser');
import { join } from 'path';
import { tokenDrawModule } from './common/tokenDraw/tokenDraw.module';

async function bootstrap() {
   fs.mkdirSync(process.env.PREFIX_UPLOAD_TMP, { recursive: true });
   console.log(`Create upload tmp folder.... ${process.env.PREFIX_UPLOAD_TMP}`);

   const app = await NestFactory.create<NestExpressApplication>(AppModule);
   app.get(ConfigService);
   app.enableCors();

   app.use(json({ limit: '100mb' }));
   app.use(urlencoded({ limit: '100mb', extended: true }));
   app.use(bodyParser.json({ limit: '50mb' }));
   app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
   let basePath = process.env.BASE_PATH;
   if (!basePath) basePath = '/';
   if (basePath != '/' && basePath.charAt(0) != '/') basePath = '/' + basePath + '/';
   app.setGlobalPrefix(basePath + 'api/v1');
   app.useStaticAssets(join(__dirname, '..', 'public'));

   new Swagger(app).setup(basePath);

   if (process.env.NODE_ENV !== 'production') {
      basePath = basePath.replace(/^\//g, '');
      new Swagger(app).setup(basePath);
   }

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
      }),
   );

   await app.listen(process.env.NODE_PORT);
   console.log(`Application is running on: ${await app.getUrl()}`);
}

class Swagger {
   constructor(private app: NestExpressApplication) { }

   /**
    * Register more swagger api here
    */
   setup(basePath = ''): void {
      this.register(undefined, basePath + 'api');
   }

   register(extraModules?: any[], path?: string, title?: string, description?: string, version?: string): void {
      const mainModules = [
         // AppModule,
         AuthModule,
         UserAuthModule,
         // UserModule,
         // RolesModule,
         // RolesModule,
         // CustomerModule,
         // CoresModule,
         // SettingModule,
         // CategoryModule,
         // AuthorModule,
         // StoryModule,
         // PostModule,
         tokenDrawModule,
      ];
      if (extraModules) {
         mainModules.push(...extraModules);
      }

      const siteTitle = title || 'API Cyber';
      const options = new DocumentBuilder()
         .setTitle(siteTitle)
         .setDescription('API Cyber description')
         .setVersion('1.0')
         .addBearerAuth()
         .build();

      const document = SwaggerModule.createDocument(this.app, options, {
         include: mainModules,
      });
      SwaggerModule.setup(path || 'api', this.app, document, { customSiteTitle: siteTitle });
   }
}

bootstrap();
