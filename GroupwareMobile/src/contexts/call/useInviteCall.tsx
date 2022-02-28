import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {ChatMessageType, User} from '../../types';
import SoundPlayer from 'react-native-sound-player';
import {LocalInvitation} from 'agora-react-native-rtm';
import {useAPISaveChatGroup} from '../../hooks/api/chat/useAPISaveChatGroup';
import {useAPISendChatMessage} from '../../hooks/api/chat/useAPISendChatMessage';
import {sendCallInvitation} from '../../utils/calling/calling';
import io from 'socket.io-client';
import {baseURL} from '../../utils/url';

const InvitationStatusContext = createContext({
  isCallAccepted: false,
  localInvitation: {} as LocalInvitation | undefined,
  setLocalInvitationState: (() => {}) as (
    invitation: LocalInvitation | undefined,
  ) => void,
  sendCallInvitation2: (async () => {}) as (
    caller: Partial<User>,
    callee: User,
  ) => Promise<void>,
  enableCallAcceptedFlag: () => {},
  disableCallAcceptedFlag: () => {},
  ringCall: () => {},
  stopRing: () => {},
  setCallTimeState: (() => {}) as (callTime: string) => void,
  sendCallHistory: (() => {}) as (message: string) => void,
});

export const InviteCallProvider: React.FC = ({children}) => {
  const {mutate: createGroup, data: groupData} = useAPISaveChatGroup();
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const {mutate: sendChatMessage} = useAPISendChatMessage({
    onSuccess: sentMsg => {
      socket.emit('message', {...sentMsg, isSender: false});
    },
  });
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [localInvitation, setLocalInvitation] = useState<
    LocalInvitation | undefined
  >();
  const [callTime, setCallTime] = useState('');
  const enableCallAcceptedFlag = () => {
    setIsCallAccepted(true);
  };
  const disableCallAcceptedFlag = () => {
    setIsCallAccepted(false);
  };
  const ringCall = () => {
    SoundPlayer.playSoundFile('ring_call', 'mp3');
  };
  const stopRing = useCallback(() => {
    SoundPlayer.stop();
  }, []);

  const setLocalInvitationState = (invitation: LocalInvitation | undefined) => {
    setLocalInvitation(invitation);
  };

  const setCallTimeState = (CallTime: string) => {
    setCallTime(CallTime);
  };

  const sendCallInvitation2 = async (caller: Partial<User>, callee: User) => {
    const invitation = await sendCallInvitation(caller, callee);
    console.log('send call invitation');
    setLocalInvitation(invitation);
    createGroup({name: '', members: [callee]});
  };

  const sendCallHistory = useCallback(
    (message: string) => {
      sendChatMessage({
        content: message,
        callTime: callTime,
        type: ChatMessageType.CALL,
        chatGroup: groupData,
      });
    },
    [callTime, groupData, sendChatMessage],
  );

  useEffect(() => {
    if (!isCallAccepted && callTime) {
      sendCallHistory('音声通話');
      setCallTime('');
    }
  }, [isCallAccepted, callTime, setCallTime, sendCallHistory]);

  useEffect(() => {
    if (localInvitation) {
      ringCall();
    } else {
      stopRing();
    }
  }, [localInvitation, stopRing]);

  useEffect(() => {
    if (isCallAccepted) {
      stopRing();
    }
  }, [isCallAccepted, stopRing]);

  return (
    <InvitationStatusContext.Provider
      value={{
        isCallAccepted,
        enableCallAcceptedFlag,
        disableCallAcceptedFlag,
        ringCall,
        stopRing,
        localInvitation,
        setLocalInvitationState,
        sendCallInvitation2,
        setCallTimeState,
        sendCallHistory,
      }}>
      {children}
    </InvitationStatusContext.Provider>
  );
};

export const useInviteCall = () => useContext(InvitationStatusContext);
