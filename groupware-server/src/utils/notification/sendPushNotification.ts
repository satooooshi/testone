import { NotificationDevice } from 'src/entities/device.entity';
import { User } from 'src/entities/user.entity';
import { getRepository } from 'typeorm';
import * as PushNotifications from 'node-pushnotifications';
import { callHistoryMessageFactory } from '../factory/callHistoryMessageFactory';

export type CustomPushNotificationData = {
  title: string;
  topic?: string;
  body: string;
  custom: {
    [key: string]: string;
  };
};

export const sendPushNotifToAllUsers = async (
  data: CustomPushNotificationData,
) => {
  const deviceRepository = getRepository(NotificationDevice);
  const devices = await deviceRepository.find();
  sendPushNotifToSpecificDevices(devices, data);
};

export const sendPushNotifToSpecificUsers = async (
  user: User[],
  data: CustomPushNotificationData,
) => {
  const deviceRepository = getRepository(NotificationDevice);
  const userIds = user.map((u) => u.id);
  if (userIds.length) {
    const devices = await deviceRepository
      .createQueryBuilder('devices')
      .leftJoin('devices.user', 'user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();
    await sendPushNotifToSpecificDevices(devices, data);
  }
};

const sendPushNotifToSpecificDevices = async (
  devices: NotificationDevice[],
  data: CustomPushNotificationData,
) => {
  const pushNotifSettings: PushNotifications.Settings = {
    gcm: {
      id: process.env.FCM_API_KEY,
    },
    isAlwaysUseFCM: true,
  };
  const pushNotifService = new PushNotifications(pushNotifSettings);
  const tokens = devices.map((d) => d.token);

  console.log('notification data', data.title, data.body);

  const dataToSend = {
    title: data.title ? data.title : '', // REQUIRED for Android
    topic: process.env.IOS_BUNDLE_ID ? '' : '', // REQUIRED for iOS (apn and gcm)
    silent: true,
    /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
     * When using certificate-based authentication, the topic is usually your app's bundle ID.
     * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
     */
    body: callHistoryMessageFactory(data.body),
    custom: data.custom,
  };

  pushNotifService.send(tokens, dataToSend, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      for (const e of result) {
        console.log(e.message);
      }
    }
  });
};
