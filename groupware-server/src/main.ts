import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { APP_DIRNAME } from './var';

const cloud_storage_settings = {
  type: process.env.CLOUD_STORAGE_TYPE,
  project_id: process.env.CLOUD_STORAGE_PROJECT_ID,
  private_key_id: process.env.CLOUD_STORAGE_PRIVATE_KEY_ID,
  private_key: process.env.CLOUD_STORAGE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLOUD_STORAGE_CLIENT_EMAIL,
  client_id: process.env.CLOUD_STORAGE_CLIENT_ID,
  auth_uri: process.env.CLOUD_STORAGE_AUTH_URL,
  token_uri: process.env.CLOUD_STORAGE_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.CLOUD_STORAGE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLOUD_STORAGE_CLIENT_X509_CERT_URL,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://editor-example-kabasawa-sgzkfl3uyq-an.a.run.app',
      'https://groupware-frontend.vercel.app',
      'groupware-frontend.vercel.app',
      'https://groupware-frontend-valleyin-dev.vercel.app',
      'https://groupware-frontend-git-develop-valleyin-dev.vercel.app',
      'https://groupware-frontend-theta.vercel.app',
      'https://groupware-seven.vercel.app',
      'https://groupware-frontend-sgzkfl3uyq-an.a.run.app',
      'https://frontend-bold-groupware-zznmsfdywq-an.a.run.app',
      'https://portal.bold.ne.jp',
      '*',
      process.env.CLIENT_DOMAIN,
    ],
  });
  const jsonEncoded = JSON.stringify(cloud_storage_settings);
  fs.writeFile(APP_DIRNAME + '/cloud_storage.json', jsonEncoded, (err) => {
    if (err) {
      console.log(err);
    }
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(process.env.PORT);
}
bootstrap();
