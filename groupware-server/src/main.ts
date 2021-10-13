import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';

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
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://groupware-frontend.vercel.app',
      'groupware-frontend.vercel.app',
      'https://groupware-frontend-valleyin-dev.vercel.app',
      'https://groupware-frontend-git-develop-valleyin-dev.vercel.app',
      'https://groupware-frontend-theta.vercel.app',
      'https://groupware-seven.vercel.app',
    ],
  });
  const jsonEncoded = JSON.stringify(cloud_storage_settings);
  fs.writeFile(__dirname + '/cloud_storage.json', jsonEncoded, (err) => {
    if (err) {
      console.log(err);
    }
  });

  await app.listen(process.env.PORT);
}
bootstrap();
