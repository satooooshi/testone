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
import {setupCallInvitation} from '../../utils/calling/calling';
import io from 'socket.io-client';
import {baseURL} from '../../utils/url';
import {ChatGroup} from '../../types';
import _, {debounce} from 'lodash';
import {useHandleBadge} from '../badge/useHandleBadge';
import {socket} from '../../utils/socket';

const InvitationStatusContext = createContext({
  isCallAccepted: false,
  localInvitation: {} as LocalInvitation | undefined,
  setLocalInvitationState: (() => {}) as (
    invitation: LocalInvitation | undefined,
  ) => void,
  sendCallInvitation: (async () => {}) as (
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
  const {mutate: createGroup} = useAPISaveChatGroup();
  const {editChatGroup, refetchRoomCard} = useHandleBadge();
  const [currentGroupData, setCurrentGroupData] = useState<ChatGroup>();
  const {mutate: sendChatMessage} = useAPISendChatMessage({
    onSuccess: sentMsg => {
      socket.emit('message', {type: 'send', chatMessage: sentMsg});
      if (sentMsg?.chatGroup?.id) {
        refetchRoomCard({id: sentMsg.chatGroup.id, type: ''});
      }
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

  const ringCall = async () => {
    SoundPlayer.loadSoundFile('ring_sound', 'mp3');
    SoundPlayer.setSpeaker(false);
    SoundPlayer.setVolume(0.1);
    SoundPlayer.play();
    // SoundPlayer.playSoundFile('ring_sound', 'mp3');
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

  const sendCallInvitation = async (caller: Partial<User>, callee: User) => {
    setCallTime('');
    const invitation = await setupCallInvitation(caller, callee);
    createGroup(
      {name: '', members: [callee]},
      {
        onSuccess: createdGroup => {
          if (createdGroup.updatedAt === createdGroup.createdAt) {
            editChatGroup(createdGroup);
          }
          setCurrentGroupData(createdGroup);
        },
      },
    );
    setLocalInvitation(invitation);
  };

  const sendCallHistory = useCallback(
    (message: string) => {
      if (currentGroupData) {
        sendChatMessage({
          content: message,
          callTime: callTime,
          type: ChatMessageType.CALL,
          chatGroup: currentGroupData,
        });
      }
      setCurrentGroupData(undefined);
    },
    [callTime, sendChatMessage, currentGroupData],
  );

  // const sendCallHistory = useCallback(
  //   (message: string) =>
  //     _.debounce(() => {
  //       console.log('currentGroupData====================', currentGroupData);

  //       sendChatMessage({
  //         content: message,
  //         callTime: callTime,
  //         type: ChatMessageType.CALL,
  //         chatGroup: currentGroupData,
  //       });
  //     }, 100),
  //   [callTime, sendChatMessage, currentGroupData],
  // );

  useEffect(
    () => {
      if (currentGroupData && !isCallAccepted && callTime) {
        sendCallHistory('????????????');
        setCallTime('');
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCallAccepted, currentGroupData],
  );

  // useEffect(() => {
  //   if (localInvitation) {
  //     setTimeout(ringCall, 3000);
  //     // ringCall();
  //   } else {
  //     stopRing();
  //   }
  // }, [localInvitation, stopRing]);

  useEffect(
    () => {
      if (isCallAccepted) {
        stopRing();
      } else if (!isCallAccepted && localInvitation) {
        ringCall();
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCallAccepted, stopRing],
  );

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
        sendCallInvitation,
        setCallTimeState,
        sendCallHistory,
      }}>
      {children}
    </InvitationStatusContext.Provider>
  );
};

export const useInviteCall = () => useContext(InvitationStatusContext);
