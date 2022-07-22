import {Alert, AppState, AppStateStatus} from 'react-native';
import io from 'socket.io-client';
import {useEffect, useState} from 'react';
import {baseURL} from './url';
import {ChatGroup, ChatMessage, ChatMessageType, SocketMessage} from '../types';
import {useHandleBadge} from '../contexts/badge/useHandleBadge';
import {useAuthenticate} from '../contexts/useAuthenticate';
import {useAPISaveLastReadChatTime} from '../hooks/api/chat/useAPISaveLastReadChatTime';
import {useAPIGetLastReadChatTime} from '../hooks/api/chat/useAPIGetLastReadChatTime';
import {getThumbnailOfVideo} from './getThumbnailOfVideo';

export const socket = io('https://www.bbbbbb.ga', {
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
  const [appState, setAppState] = useState<AppStateStatus>('active');

  let isMounted: boolean | undefined;

  const saveLastReadTimeAndReport = () => {
    saveLastReadChatTime(room.id, {
      onSuccess: () => {
        socket.emit('readReport', {
          room: room.id.toString(),
          senderId: myself?.id,
        });
        handleEnterRoom(room.id);
      },
    });
  };
  const connect = () => {
    if (socket.disconnected) {
      socket.connect();
      console.log('socket connected.');
    }
  };

  useEffect(() => {
    const unsubscribeAppState = () => {
      AppState.addEventListener('change', state => {
        setAppState(state);
      });
    };
    return () => {
      unsubscribeAppState();
    };
  });

  return {
    joinRoom: () => {
      connect();

      setCurrentChatRoomId(room.id);
      isMounted = true;
      socket.emit('joinRoom', room.id.toString());

      socket.on('readMessageClient', async (senderId: string) => {
        // console.log('readMessageClient called', senderId, myself?.id, room.id);
        if (myself?.id && senderId && senderId !== `${myself?.id}`) {
          refetchLastReadChatTime();
        }
      });
      socket.on('msgToClient', async (socketMessage: SocketMessage) => {
        console.log('msgToClient called', socketMessage);

        if (!socketMessage.chatMessage) {
          return;
        }
        if (socketMessage.chatMessage?.sender?.id === myself?.id) {
          socketMessage.chatMessage.isSender = true;
        }
        switch (socketMessage.type) {
          case 'send': {
            if (socketMessage.chatMessage.content) {
              // if (
              //   !socketMessage.chatMessage?.isSender &&
              //   appState === 'active'
              // ) {
              //   saveLastReadTimeAndReport();
              //   refetchLastReadChatTime();
              // }
              socketMessage.chatMessage.createdAt = new Date(
                socketMessage.chatMessage.createdAt,
              );
              socketMessage.chatMessage.updatedAt = new Date(
                socketMessage.chatMessage.updatedAt,
              );
              // setImagesForViewing(i => [...i, {uri: socketMessage.chatMessage.content}]);
              if (socketMessage.chatMessage.type === ChatMessageType.VIDEO) {
                socketMessage.chatMessage.thumbnail = await getThumbnailOfVideo(
                  socketMessage.chatMessage.content,
                  socketMessage.chatMessage.fileName,
                );
              }
              if (isMounted) {
                setMessages(msgs => {
                  if (
                    msgs.length &&
                    msgs[0].id !== socketMessage.chatMessage.id &&
                    socketMessage.chatMessage.chatGroup?.id === room.id
                  ) {
                    return refreshMessage([socketMessage.chatMessage, ...msgs]);
                  } else if (
                    socketMessage.chatMessage.chatGroup?.id !== room.id
                  ) {
                    return refreshMessage(
                      msgs.filter(m => m.id !== socketMessage.chatMessage.id),
                    );
                  }
                  return refreshMessage(msgs);
                });
              }
            }
            break;
          }
          case 'edit': {
            setMessages(msgs => {
              return msgs.map(m =>
                m.id === socketMessage.chatMessage.id
                  ? socketMessage.chatMessage
                  : m,
              );
            });
            break;
          }
          case 'delete': {
            setMessages(msgs => {
              return msgs.filter(m => m.id !== socketMessage.chatMessage.id);
            });
            break;
          }
        }
      });
    },
    leaveRoom: () => {
      setMessages([]);
      socket.emit('leaveRoom', room.id.toString());
      socket.removeAllListeners();
      isMounted = false;
      setCurrentChatRoomId(undefined);
    },
    send: (m: SocketMessage) => {
      socket.emit('message', m);
    },
    saveLastReadTimeAndReport,
    lastReadChatTime,
  };
};
