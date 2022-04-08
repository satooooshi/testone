import RtmClient, {LocalInvitation} from 'agora-react-native-rtm';
import Config from 'react-native-config';
import uuid from 'react-native-uuid';
import {User} from '../../types';
import {userNameFactory} from '../factory/userNameFactory';
import {axiosInstance} from '../url';

export const setupCallInvitation = async (
  caller: Partial<User>,
  callee: User,
): Promise<LocalInvitation> => {
  const rtmEngine = new RtmClient();
  await rtmEngine.createInstance(Config.AGORA_APP_ID);
  const parsedUUid = uuid.v4();
  const localInvitation = await rtmEngine.createLocalInvitation(
    callee.id.toString(),
    userNameFactory(caller),
    // channel id はcallkeepとの関係でUUIDでなければならない
    parsedUUid as string,
  );
  const res = await axiosInstance.get<string>('/chat/get-rtm-token');
  await rtmEngine.loginV2(caller?.id?.toString() as string, res.data);
  console.log('loginv2 completed');

  await rtmEngine.sendLocalInvitationV2(localInvitation);
  // iOSのためにプッシュ通知も送る
  // await axiosInstance.post(`/chat/notif-call/${caller.id}`, localInvitation);
  return localInvitation;
};
