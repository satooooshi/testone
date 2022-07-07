import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationDevice } from 'src/entities/device.entity';
import { Repository } from 'typeorm';

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
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(NotificationDevice)
    private readonly deviceRepository: Repository<NotificationDevice>,
  ) {}

  async deleteDevice(token: string) {
    const existDevice = await this.deviceRepository.findOne({
      where: { token: token },
    });
    if (existDevice) {
      console.log('deleteDevice called');
      const result = await this.deviceRepository.delete(existDevice);
      console.log('deleteDevice called', result);
      return result;
    }
  }

  async registerDevice(
    device: Partial<NotificationDevice>,
  ): Promise<NotificationDevice> {
    const existDevice = await this.deviceRepository.findOne({
      where: { token: device?.token },
      relations: ['user'],
    });
    if (existDevice?.user?.id === device?.user?.id) {
      return existDevice;
    }
    if (existDevice) {
      const savedDevice = await this.deviceRepository.save({
        ...existDevice,
        user: device.user,
      });
      return savedDevice;
    }
    const newDevice = await this.deviceRepository.save({
      ...device,
      user: device.user,
    });
    return newDevice;
  }

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
        template: __dirname + '/../../templates/index', // The `.pug` or `.hbs` extension is appended automatically.
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
