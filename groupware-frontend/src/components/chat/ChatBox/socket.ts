import { useAPIGetLastReadChatTime } from '@/hooks/api/chat/useAPIGetLastReadChatTime';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { ChatGroup, ChatMessage } from 'src/types';
// import { baseURL } from 'src/utils/url';

// socket
const socket = io('http://34.84.206.131:3001/', {
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
        console.log('socket readMessageClient----', senderId);
        if (user?.id && senderId && senderId != `${user?.id}`) {
          refetchLastReadChatTime();
        }
      });

      socket.on('msgToClient', async (sentMsgByOtherUsers: ChatMessage) => {
        console.log('socket msgToClient----', sentMsgByOtherUsers);

        if (sentMsgByOtherUsers.content) {
          if (sentMsgByOtherUsers?.sender?.id !== user?.id) {
            saveLastReadChatTime(room.id, {
              onSuccess: () => report(),
            });
            refetchLastReadChatTime();
          }
          sentMsgByOtherUsers.createdAt = new Date(
            sentMsgByOtherUsers.createdAt,
          );
          sentMsgByOtherUsers.updatedAt = new Date(
            sentMsgByOtherUsers.updatedAt,
          );
          if (sentMsgByOtherUsers.sender?.id === user?.id) {
            sentMsgByOtherUsers.isSender = true;
          }
          setMessages((msgs) => {
            if (
              msgs.length &&
              msgs[0].id !== sentMsgByOtherUsers.id &&
              sentMsgByOtherUsers.chatGroup?.id === room.id
            ) {
              return [sentMsgByOtherUsers, ...msgs];
            } else if (sentMsgByOtherUsers.chatGroup?.id !== room.id) {
              return msgs.filter((m) => m.id !== sentMsgByOtherUsers.id);
            }
            return msgs;
          });
        }
      });
    },
    leaveRoom: () => {
      socket.emit('leaveRoom', room.id);
      setCurrentChatRoomId(undefined);
    },
    send: (m: ChatMessage) => {
      socket.emit('message', { ...m, isSender: false });
    },
    lastReadChatTime,
  };
};
