import { MenuValue, useModalReducer } from '@/hooks/chat/useModalReducer';
import React, { useEffect, useState } from 'react';
import { ChatGroup, User } from 'src/types';
import { useMediaQuery, Box, useToast, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAPILeaveChatRoom } from '@/hooks/api/chat/useAPILeaveChatRoomURL';
import ChatBox from '@/components/chat/ChatBox';
import 'emoji-mart/css/emoji-mart.css';
import RoomList from '@/components/chat/RoomList';
import { useAPIGetRoomDetail } from '@/hooks/api/chat/useAPIGetRoomDetail';
import ChatLayout from '@/components/chat/Layout';
import { useAPIDeleteChatRoom } from '@/hooks/api/chat/useAPIDeleteChatRoom';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { useAuthenticate } from 'src/contexts/useAuthenticate';

const ChatDetail = () => {
  const router = useRouter();
  const [modalStates, dispatchModal] = useModalReducer();
  const { id } = router.query as { id: string };
  const [currentRoom, setCurrentRoom] = useState<ChatGroup>();
  const { user } = useAuthenticate();
  // const socket = io(baseURL, {
  //   transports: ['websocket'],
  // });
  const { setChatGroupsState, chatGroups } = useHandleBadge();
  const { refetch: getRoom } = useAPIGetRoomDetail(Number(id), {
    enabled: false,
    onSuccess: (data) => {
      const isMember = data.members?.filter((m) => m.id === user?.id).length;
      if (!isMember) {
        data.name = 'メンバーがいません';
        data.members = [];
        setChatGroupsState(chatGroups.filter((g) => g.id !== data.id));
      }
      setCurrentRoom(data);
    },
    onError: (err) => {
      setCurrentRoom(undefined);
      if (err?.response?.data?.message) {
        alert(err?.response?.data?.message);
      }
    },
  });

  useEffect(() => {
    // const room = id ? getOneRoom(Number(id)) : undefined;
    // room ? setCurrentRoom(room) : getRoom();
    getRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const { mutate: leaveChatGroup } = useAPILeaveChatRoom({
    onSuccess: () => {
      router.push('/chat');
    },
  });

  const { mutate: deleteChatGroup } = useAPIDeleteChatRoom();

  const handleMenuSelected = (menuValue: MenuValue) => {
    switch (menuValue) {
      case 'editMembers':
        dispatchModal({
          type: 'editMembersModalVisible',
          value: true,
        });
        break;
      case 'editOwners':
        dispatchModal({
          type: 'editOwnersModalVisible',
          value: true,
        });
      case 'editGroup':
        dispatchModal({
          type: 'editChatGroupModalVisible',
          value: true,
        });
        break;
      case 'leaveRoom':
        if (confirm('このルームを退室してよろしいですか？')) {
          leaveChatGroup(
            { id: Number(id) },
            {
              onSuccess: () => {
                router.push('/chat', undefined, { shallow: true }),
                  setChatGroupsState(
                    chatGroups.filter((g) => g.id != Number(id)),
                  );
              },
            },
          );
        }
        break;
    }
    if (menuValue === 'deleteRoom') {
      if (confirm('このルームを解散してよろしいですか？')) {
        deleteChatGroup(
          { id: Number(id) },
          {
            onSuccess: () => {
              router.push('/chat', undefined, { shallow: true });
              setChatGroupsState(chatGroups.filter((g) => g.id != Number(id)));
            },
          },
        );
      }
      return;
    }
  };

  return (
    <ChatLayout
      currentRoom={currentRoom}
      setCurrentRoom={setCurrentRoom}
      modalStates={modalStates}
      dispatchModal={dispatchModal}>
      <Box
        w="100%"
        display="flex"
        flexDir="row"
        h="83vh"
        justifyContent="center">
        {!isSmallerThan768 ? (
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
        ) : currentRoom ? (
          <ChatBox room={currentRoom} onMenuClicked={handleMenuSelected} />
        ) : null}
      </Box>
    </ChatLayout>
  );
};

export default ChatDetail;
