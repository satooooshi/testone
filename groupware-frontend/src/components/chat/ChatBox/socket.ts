import { useAPIGetLastReadChatTime } from '@/hooks/api/chat/useAPIGetLastReadChatTime';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { ChatGroup, ChatMessage, SocketMessage } from 'src/types';
import { baseURL } from 'src/utils/url';
// import { baseURL } from 'src/utils/url';

// socket
export const socket = io('https://www.bbbbbb.ga:443', {
  transports: ['websocket'],
});

export const useChatSocket = (
  room: ChatGroup,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) => {
  const { handleEnterRoom } = useHandleBadge();
  const { user, setCurrentChatRoomId } = useAuthenticate();
  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime();
  const { needRefetch } = useRoomRefetch();
  const { data: lastReadChatTime, refetch: refetchLastReadChatTime } =
    useAPIGetLastReadChatTime(room.id, {
      onSuccess: () => {
        needRefetch();
      },
    });

  const report = () => {
    socket.emit('readReport', {
      room: room.id.toString(),
      senderId: user?.id,
    });
  };

  if (socket.disconnected) {
    socket.connect();
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
      socket.emit('joinRoom', room.id.toString());

      socket.on('readMessageClient', async (senderId: string) => {
        // console.log('socket readMessageClient----', senderId);
        if (user?.id && senderId && senderId != `${user?.id}`) {
          refetchLastReadChatTime();
        }
      });
      socket.on('msgToClient', async (socketMessage: SocketMessage) => {
        // console.log('msgToClient called', socketMessage);
        if (!socketMessage.chatMessage) {
          return;
        }
        if (socketMessage.chatMessage?.sender?.id === user?.id) {
          socketMessage.chatMessage.isSender = true;
        }
        switch (socketMessage.type) {
          case 'send': {
            if (socketMessage.chatMessage.content) {
              if (!socketMessage.chatMessage?.isSender) {
                saveLastReadChatTime(room.id, {
                  onSuccess: () => report(),
                });
                refetchLastReadChatTime();
              }
              socketMessage.chatMessage.createdAt = new Date(
                socketMessage.chatMessage.createdAt,
              );
              socketMessage.chatMessage.updatedAt = new Date(
                socketMessage.chatMessage.updatedAt,
              );
              if (socketMessage.chatMessage.sender?.id === user?.id) {
                socketMessage.chatMessage.isSender = true;
              }
              setMessages((msgs) => {
                if (
                  msgs.length &&
                  msgs[0].id !== socketMessage.chatMessage.id &&
                  socketMessage.chatMessage.chatGroup?.id === room.id
                ) {
                  return [socketMessage.chatMessage, ...msgs];
                } else if (
                  socketMessage.chatMessage.chatGroup?.id !== room.id
                ) {
                  return msgs.filter(
                    (m) => m.id !== socketMessage.chatMessage.id,
                  );
                }
                return msgs;
              });
            }
            break;
          }
          case 'edit': {
            // console.log('edit called', socketMessage.chatMessage.content);
            setMessages((msgs) => {
              return msgs.map((m) =>
                m.id === socketMessage.chatMessage.id
                  ? socketMessage.chatMessage
                  : m,
              );
            });
            break;
          }
          case 'delete': {
            setMessages((msgs) => {
              return msgs.filter((m) => m.id !== socketMessage.chatMessage.id);
            });
            break;
          }
        }
      });
    },
    leaveRoom: () => {
      socket.emit('leaveRoom', room.id.toString());
      socket.removeAllListeners();
      setCurrentChatRoomId(undefined);
    },
    send: (m: SocketMessage) => {
      socket.emit('message', m);
    },
    lastReadChatTime,
  };
};
