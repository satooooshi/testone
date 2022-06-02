import { MenuValue, useModalReducer } from '@/hooks/chat/useModalReducer';
import React, { useState } from 'react';
import { ChatGroup } from 'src/types';
import { useMediaQuery, Box, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAPILeaveChatRoom } from '@/hooks/api/chat/useAPILeaveChatRoomURL';
import ChatBox from '@/components/chat/ChatBox';
import 'emoji-mart/css/emoji-mart.css';
import RoomList from '@/components/chat/RoomList';
import { useAPIGetRoomDetail } from '@/hooks/api/chat/useAPIGetRoomDetail';
import ChatLayout from '@/components/chat/Layout';

const ChatDetail = () => {
  const router = useRouter();
  const [_, dispatchModal] = useModalReducer();
  const { id } = router.query as { id: string };

  const [currentRoom, setCurrentRoom] = useState<ChatGroup>();

  useAPIGetRoomDetail(Number(id), {
    onSuccess: (data) => {
      setCurrentRoom(data);
    },
    onError: (err) => {
      setCurrentRoom(undefined);
      if (err?.response?.data?.message) {
        alert(err?.response?.data?.message);
      }
    },
  });
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const { mutate: leaveChatGroup } = useAPILeaveChatRoom({
    onSuccess: () => {
      router.push('/chat');
    },
  });

  const handleMenuSelected = (menuValue: MenuValue) => {
    if (menuValue === 'editMembers') {
      dispatchModal({
        type: 'editMembersModalVisible',
        value: true,
      });
      return;
    }
    if (menuValue === 'editGroup') {
      dispatchModal({
        type: 'editChatGroupModalVisible',
        value: true,
      });
      return;
    }
    if (menuValue === 'leaveRoom') {
      if (confirm('このルームを退室してよろしいですか？')) {
        leaveChatGroup(
          { id: Number(id) },
          {
            onSuccess: () => router.push('/chat', undefined, { shallow: true }),
          },
        );
      }
      return;
    }
  };

  return (
    <ChatLayout currentRoom={currentRoom} setCurrentRoom={setCurrentRoom}>
      <Box
        w="100%"
        display="flex"
        flexDir="row"
        h="83vh"
        justifyContent="center">
        {!isSmallerThan768 && (
          <>
            <Box w="30vw">
              <RoomList
                currentId={id}
                onClickRoom={(g) =>
                  router.push(`/chat/${g.id.toString()}`, undefined, {
                    shallow: true,
                  })
                }
              />
            </Box>
            {currentRoom ? (
              <ChatBox room={currentRoom} onMenuClicked={handleMenuSelected} />
            ) : (
              <Box
                w="60vw"
                h="100%"
                display="flex"
                flexDir="row"
                justifyContent="center"
                alignItems="center"
                boxShadow="md"
                bg="white"
                borderRadius="md">
                <Text position="absolute" top="auto" bottom="auto">
                  ルームを選択してください
                </Text>
              </Box>
            )}
          </>
        )}
      </Box>
    </ChatLayout>
  );
};

export default ChatDetail;
