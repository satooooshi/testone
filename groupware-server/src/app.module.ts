import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventScheduleModule } from './modules/event/event.module';
import { TagModule } from './modules/tag/tag.module';
import { StorageModule } from './modules/storage/storage.module';
import { ChatModule } from './modules/chat/chat.module';
import { WikiModule } from './modules/wiki/wiki.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TopNewsModule } from './modules/top-news/top-news.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_DIRNAME } from './var';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.development.env' }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          auth: {
            user: configService.get('EMAIL_ID'),
            pass: configService.get('EMAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get('EMAIL_FROM'),
        },
        template: {
          dir: APP_DIRNAME + '/templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        port: configService.get('DB_PORT'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: false,
        // migrations:
        //   process.env.NODE_ENV !== 'production'
        //     ? [__dirname + '/migrations/*{.js}']
        //     : [__dirname + '/migrations/*{.ts,.js}'],
        // migrationsRun: true,
        extra: {
          charset: 'utf8mb4_bin',
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    WikiModule,
    EventScheduleModule,
    TagModule,
    StorageModule,
    ChatModule,
    NotificationModule,
    TopNewsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
