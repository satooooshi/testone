import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

export type EmailTemplateContext = {
  to: string | string[];
  subject: string;
  title: string;
  content: string;
  buttonLink: string;
  buttonName: string;
};

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}
  async sendEmailNotification({
    to,
    subject,
    title,
    content,
    buttonLink,
    buttonName,
  }: EmailTemplateContext) {
    this.mailerService
      .sendMail({
        to,
        subject,
        template: './index', // The `.pug` or `.hbs` extension is appended automatically.
        context: {
          // Data to be sent to template engine.
          title,
          content,
          buttonLink,
          buttonName,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
