import { NotificationDevice } from 'src/entities/device.entity';
import { User } from 'src/entities/user.entity';
import { getRepository } from 'typeorm';
import * as PushNotifications from 'node-pushnotifications';

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
  const dataToSend: PushNotifications.Data = {
    title: data.title, // REQUIRED for Android
    topic: process.env.IOS_BUNDLE_ID ? '' : '', // REQUIRED for iOS (apn and gcm)
    /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
     * When using certificate-based authentication, the topic is usually your app's bundle ID.
     * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
     */
    body: data.body,
    custom: data.custom,
    priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high'
    collapseKey: '', // gcm for android, used as collapseId in apn
    contentAvailable: true, // gcm, apn. node-apn will translate true to 1 as required by apn.
    delayWhileIdle: true, // gcm for android
    restrictedPackageName: '', // gcm for android
    dryRun: false, // gcm for android
    icon: 'https://portal.bold.ne.jp/_next/image?url=%2F_next%2Fstatic%2Fimage%2Fpublic%2Fbold-logo.22bda447bf8117298663d36dd31fcf59.png&w=1080&q=75', // gcm for android
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    image: '', // gcm for android
    style: '', // gcm for android
    picture: '', // gcm for android
    tag: '', // gcm for android
    color: '', // gcm for android
    clickAction: '', // gcm for android. In ios, category will be used if not supplied
    locKey: '', // gcm, apn
    titleLocKey: '', // gcm, apn
    locArgs: undefined, // gcm, apn. Expected format: Stringified Array
    titleLocArgs: undefined, // gcm, apn. Expected format: Stringified Array
    retries: 1, // gcm, apn
    encoding: '', // apn
    badge: 2, // gcm for ios, apn
    android_channel_id: 'default-channel-id', // gcm - Android Channel ID
    notificationCount: 0, // fcm for android. badge can be used for both fcm and apn
    alert: {
      // apn, will take precedence over title and body
      title: data.title,
      body: data.body,
      // details: https://github.com/node-apn/node-apn/blob/master/doc/notification.markdown#convenience-setters
    },
    silent: false, // gcm, apn, will override badge, sound, alert and priority if set to true on iOS, will omit `notification` property and send as data-only on Android/GCM
    /*
     * A string is also accepted as a payload for alert
     * Your notification won't appear on ios if alert is empty object
     * If alert is an empty string the regular 'title' and 'body' will show in Notification
     */
    // alert: '',
    launchImage: '', // apn and gcm for ios
    action: '', // apn and gcm for ios
    category: '', // apn and gcm for ios
    // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
    // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
    urlArgs: '', // apn and gcm for ios
    truncateAtWordEnd: true, // apn and gcm for ios
    mutableContent: 0, // apn
    threadId: '', // apn
    pushType: undefined, // apn. valid values are 'alert' and 'background' (https://github.com/parse-community/node-apn/blob/master/doc/notification.markdown#notificationpushtype)
    timeToLive: 28 * 86400,
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
