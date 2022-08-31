import RtmClient, {LocalInvitation} from 'agora-react-native-rtm';
import {userNameFactory} from '../factory/userNameFactory';
import {axiosInstance} from '../url';
import Config from 'react-native-config';
import uuid from 'react-native-uuid';
import {User} from '../../types';

const rtmEngine = new RtmClient();

export const sendInvitation = async (
  caller: Partial<User>,
  callee: User,
): Promise<LocalInvitation> => {
  await rtmEngine.createInstance(Config.AGORA_APP_ID);
  const parsedUUid = uuid.v4();
  const localInvitation = await rtmEngine.createLocalInvitation(
    callee.id.toString(),
    userNameFactory(caller),
    parsedUUid as string,
  );
  const res = await axiosInstance.get<string>('/chat/get-rtm-token');
  await rtmEngine.loginV2(caller.id?.toString() as string, res.data);
  await rtmEngine.sendLocalInvitationV2(localInvitation);
  await axiosInstance.get(`/chat/notif-call/${caller.id}`);
  return localInvitation;
};

export const cancelCallInvitation = async (
  localInvitation: LocalInvitation,
) => {
  await rtmEngine.createInstance(Config.AGORA_APP_ID);
  try {
    await rtmEngine?.cancelLocalInvitationV2(localInvitation);
  } catch (e) {
    console.error(e);
  }
};
