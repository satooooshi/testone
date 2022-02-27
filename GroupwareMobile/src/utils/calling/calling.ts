import RtmClient, {LocalInvitation} from 'agora-react-native-rtm';
import Config from 'react-native-config';
import uuid from 'react-native-uuid';
import {User} from '../../types';
import {userNameFactory} from '../factory/userNameFactory';
import {axiosInstance} from '../url';

export const sendCallInvitation = async (
  caller: Partial<User>,
  callee: User,
): Promise<LocalInvitation> => {
  const rtmEngine = new RtmClient();
  await rtmEngine.createInstance(Config.AGORA_APP_ID);
  const parsedUUid = uuid.v4();
  const localInvitation = await rtmEngine.createLocalInvitation(
    callee.id.toString(),
    userNameFactory(caller),
    parsedUUid as string,
  );
  const res = await axiosInstance.get<string>('/chat/get-rtm-token');
  await rtmEngine.loginV2(caller?.id?.toString() as string, res.data);
  await rtmEngine.sendLocalInvitationV2(localInvitation);
  await axiosInstance.post(`/chat/notif-call/${caller.id}`, localInvitation);
  return localInvitation;
};
