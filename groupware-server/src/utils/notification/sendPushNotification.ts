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
  userIds: number[],
  data: CustomPushNotificationData,
) => {
  const deviceRepository = getRepository(NotificationDevice);
  if (userIds.length) {
    const devices = await deviceRepository
      .createQueryBuilder('devices')
      .where('devices.user_id IN (:...userIds)', { userIds })
      .getMany();
    // console.log('-----length', devices.length);

    if (devices.length) {
      await sendPushNotifToSpecificDevices(devices, data);
    }
  }
};

const sendPushNotifToSpecificDevices = async (
  devices: NotificationDevice[],
  data: CustomPushNotificationData,
) => {
  const pushNotifSettings = {
    gcm: {
      id: process.env.FCM_API_KEY,
    },
    isAlwaysUseFCM: true,
  };
  const pushNotifService = new PushNotifications(pushNotifSettings);
  const tokens = devices.map((d) => d.token);

  const dataToSend = {
    title: data.title ? data.title : '', // REQUIRED for Android
    topic: process.env.IOS_BUNDLE_ID ? '' : '', // REQUIRED for iOS (apn and gcm)
    // icon: 'ic_push_notification', // optional, defaults to 'ic_launcher'.
    contentAvailable: true,
    priority: 'high',
    silent: data?.custom?.silent === 'silent',
    // badge: data.custom.type === 'badge' ? 1 : 0,
    sound: data.title ? 'local.wav' : undefined,
    // android_channel_id: 'default-channel-id',
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
      // console.log(result);
      // for (const e of result) {
      //   console.log(e.message);
      // }
    }
  });
};
