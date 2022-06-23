import {AppState, AppStateStatus} from 'react-native';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import io from 'socket.io-client';
import {baseURL, storage} from '../../utils/url';
import {ChatGroup, ChatMessage, ChatMessageType} from '../../types';
import {getThumbnailOfVideo} from '../../utils/getThumbnailOfVideo';
import {useHandleBadge} from '../../contexts/badge/useHandleBadge';
import {useAPISaveLastReadChatTime} from '../../hooks/api/chat/useAPISaveLastReadChatTime';
import {useAPIGetLastReadChatTime} from '../../hooks/api/chat/useAPIGetLastReadChatTime';
import {useEffect, useState} from 'react';

export const socket = io('https://www.aaaaaa.ml', {
  transports: ['websocket'],
  forceNew: true,
  upgrade: false,
});

export const useChatSocket = (
  room: ChatGroup,
  refreshMessage: (targetMessages: ChatMessage[]) => ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) => {
  const {handleEnterRoom} = useHandleBadge();
  const {user: myself, setCurrentChatRoomId} = useAuthenticate();
  const {mutate: saveLastReadChatTime} = useAPISaveLastReadChatTime();
  const {data: lastReadChatTime, refetch: refetchLastReadChatTime} =
    useAPIGetLastReadChatTime(room.id);

  let isMounted: boolean | undefined;

  const report = () => {
    socket.emit('readReport', {
      room: room.id.toString(),
      senderId: myself?.id,
    });
  };

  if (socket.disconnected) {
    socket.connect();
    console.log('------');
  }

  useEffect(() => {
    saveLastReadChatTime(room.id, {
      onSuccess: () => {
        report();
        handleEnterRoom(room.id);
      },
    });
    return () => saveLastReadChatTime(room.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id, saveLastReadChatTime]);

  return {
    joinRoom: () => {
      setCurrentChatRoomId(room.id);
      isMounted = true;
      socket.emit('joinRoom', room.id.toString());

      socket.on('readMessageClient', async (senderId: string) => {
        console.log('readMessageClient called', senderId, myself?.id, room.id);
        if (myself?.id && senderId && senderId !== `${myself?.id}`) {
          refetchLastReadChatTime();
        }
      });

      socket.on('msgToClient', async (sentMsgByOtherUsers: ChatMessage) => {
        console.log('msgToClient', sentMsgByOtherUsers);
        if (sentMsgByOtherUsers.content) {
          if (
            sentMsgByOtherUsers?.sender?.id !== myself?.id &&
            AppState.currentState === 'active'
          ) {
            saveLastReadChatTime(room.id, {
              onSuccess: () => {
                report();
                handleEnterRoom(room.id);
              },
            });
            refetchLastReadChatTime();
          }
          sentMsgByOtherUsers.createdAt = new Date(
            sentMsgByOtherUsers.createdAt,
          );
          sentMsgByOtherUsers.updatedAt = new Date(
            sentMsgByOtherUsers.updatedAt,
          );
          if (sentMsgByOtherUsers.sender?.id === myself?.id) {
            sentMsgByOtherUsers.isSender = true;
          }
          // setImagesForViewing(i => [...i, {uri: sentMsgByOtherUsers.content}]);
          if (sentMsgByOtherUsers.type === ChatMessageType.VIDEO) {
            sentMsgByOtherUsers.thumbnail = await getThumbnailOfVideo(
              sentMsgByOtherUsers.content,
              sentMsgByOtherUsers.fileName,
            );
          }
          if (isMounted) {
            setMessages(msgs => {
              if (
                msgs.length &&
                msgs[0].id !== sentMsgByOtherUsers.id &&
                sentMsgByOtherUsers.chatGroup?.id === room.id
              ) {
                return refreshMessage([sentMsgByOtherUsers, ...msgs]);
              } else if (sentMsgByOtherUsers.chatGroup?.id !== room.id) {
                return refreshMessage(
                  msgs.filter(m => m.id !== sentMsgByOtherUsers.id),
                );
              }
              return refreshMessage(msgs);
            });
          }
        }
      });
    },
    leaveRoom: () => {
      setMessages([]);
      socket.emit('leaveRoom', room.id);
      socket.removeAllListeners();
      isMounted = false;
      setCurrentChatRoomId(undefined);
    },
    send: (m: ChatMessage) => {
      socket.emit('message', {...m, isSender: false});
    },
    report,
    lastReadChatTime,
  };
};
