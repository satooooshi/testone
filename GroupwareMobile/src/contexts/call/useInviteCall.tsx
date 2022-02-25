import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import SoundPlayer from 'react-native-sound-player';
import {LocalInvitation} from 'agora-react-native-rtm';
import {ChatMessageType, User} from '../../types';
import {
  cancelCallInvitation,
  sendInvitation,
} from '../../utils/calling/inviteCall';
import {useAPISaveChatGroup} from '../../hooks/api/chat/useAPISaveChatGroup';
import {useAPISendChatMessage} from '../../hooks/api/chat/useAPISendChatMessage';
import io from 'socket.io-client';
import {baseURL} from '../../utils/url';

interface IInvitationStatusContext {
  isCallAccepted: boolean;
  localInvitation: LocalInvitation | undefined;
  sendCallInvitation: (caller: Partial<User>, callee: User) => Promise<void>;
  enableCallAcceptedFlag: () => void;
  disableCallAcceptedFlag: () => void;
  cancelInvitation: () => Promise<void>;
}

const InvitationStatusContext = createContext<IInvitationStatusContext>({
  isCallAccepted: false,
  localInvitation: undefined as LocalInvitation | undefined,
  sendCallInvitation: async () => {},
  enableCallAcceptedFlag: () => {},
  disableCallAcceptedFlag: () => {},
  cancelInvitation: async () => {},
});

export const InviteCallProvider: React.FC = ({children}) => {
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [localInvitation, setLocalInvitation] = useState<LocalInvitation>();
  const [resetInvitation, setResetInvitation] = useState(false);

  const {mutate: createGroup, data: groupData} = useAPISaveChatGroup();
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const {mutate: sendChatMessage} = useAPISendChatMessage({
    onSuccess: sentMsg => {
      socket.emit('message', {...sentMsg, isSender: false});
    },
  });

  const enableCallAcceptedFlag = () => {
    setIsCallAccepted(true);
  };
  const disableCallAcceptedFlag = () => {
    setIsCallAccepted(false);
  };
  const startRing = () => {
    SoundPlayer.setNumberOfLoops(5);
    SoundPlayer.play();
  };
  const stopRing = () => {
    SoundPlayer.stop();
  };

  const sendCallInvitation = async (caller: Partial<User>, callee: User) => {
    const invitation = await sendInvitation(caller, callee);
    console.log('send call invitation');
    setLocalInvitation(invitation);
    createGroup({name: '', members: [callee]});
    startRing();
    console.log(
      'sendCallInvitation =================================================',
      groupData,
    );
    sendChatMessage({
      content: 'キャンセル',
      type: ChatMessageType.CALL,
      chatGroup: groupData,
    });
  };

  const cancelInvitation = useCallback(async () => {
    if (localInvitation) {
      stopRing();
      setResetInvitation(true);
      setLocalInvitation(undefined);

      // sendChatMessage({
      //   content: 'キャンセル',
      //   type: ChatMessageType.IMAGE,
      //   chatGroup: groupData,
      // });
    } else {
      console.error('invitationが送信されていません');
    }
  }, [localInvitation]);

  useEffect(() => {
    console.log(localInvitation, isCallAccepted);
    const timeoutInvitation = async () => {
      await new Promise(resolve => setTimeout(resolve, 10000));
      setResetInvitation(true);
    };
    timeoutInvitation();
  }, [localInvitation, isCallAccepted, cancelInvitation]);

  useEffect(() => {
    SoundPlayer.loadSoundFile('ring_call', 'mp3');
  }, []);

  useEffect(() => {
    const cancel = async () => {
      if (resetInvitation && localInvitation && !isCallAccepted) {
        await cancelInvitation();
      }
    };
    cancel();
    setResetInvitation(false);
  }, []);

  return (
    <InvitationStatusContext.Provider
      value={{
        isCallAccepted,
        localInvitation,
        enableCallAcceptedFlag,
        disableCallAcceptedFlag,
        sendCallInvitation,
        cancelInvitation,
      }}>
      {children}
    </InvitationStatusContext.Provider>
  );
};

export const useInviteCall = () => useContext(InvitationStatusContext);
