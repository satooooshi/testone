import { SidebarScreenName } from '@/components/layout/Sidebar';
import { MenuValue, useModalReducer } from '@/hooks/chat/useModalReducer';
import React, { useState } from 'react';
import { ChatGroup } from 'src/types';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { useMediaQuery, Box, useToast, Text } from '@chakra-ui/react';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { Tab } from 'src/types/header/tab/types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import EditChatGroupModal from '@/components/chat/EditChatGroupModal';
import EditChatGroupMembersModal from '@/components/chat/EditChatGroupMembersModal';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useAPILeaveChatRoom } from '@/hooks/api/chat/useAPILeaveChatRoomURL';
import ChatBox from '@/components/chat/ChatBox';
import 'emoji-mart/css/emoji-mart.css';
import RoomList from '@/components/chat/RoomList';
import { useAPIUpdateChatGroup } from '@/hooks/api/chat/useAPIUpdateChatGroup';
import { RoomRefetchProvider } from 'src/contexts/chat/useRoomRefetch';
import { useAPIGetRoomDetail } from '@/hooks/api/chat/useAPIGetRoomDetail';

const ChatDetail = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [currentRoom, setCurrentRoom] = useState<ChatGroup>();
  const [
    { editChatGroupModalVisible, createGroupWindow, editMembersModalVisible },
    dispatchModal,
  ] = useModalReducer();
  const { mutate: updateGroup } = useAPIUpdateChatGroup();
  const toast = useToast();
  useAPIGetRoomDetail(Number(id), {
    onSuccess: (data) => {
      if (setCurrentRoom) {
        setCurrentRoom(data);
      }
    },
    onError: (err) => {
      alert('kosei error');
      if (setCurrentRoom) {
        setCurrentRoom(undefined);
      }
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

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'chatDetail',
    router,
    isSmallerThan768,
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
    <RoomRefetchProvider>
      <LayoutWithTab
        sidebar={{ activeScreenName: SidebarScreenName.CHAT }}
        header={{
          title: 'Chat',
          tabs: tabs,
          rightButtonName: 'ルームを作成',
          onClickRightButton: () =>
            dispatchModal({ type: 'createGroupWindow', value: true }),
        }}>
        <Head>
          <title>ボールド | Chat</title>
        </Head>

        <CreateChatGroupModal
          isOpen={createGroupWindow}
          closeModal={() => {
            dispatchModal({ type: 'createGroupWindow', value: false });
          }}
        />
        {currentRoom ? (
          <>
            <EditChatGroupModal
              isOpen={editChatGroupModalVisible}
              chatGroup={currentRoom}
              onComplete={(newInfo) => setCurrentRoom(newInfo)}
              closeModal={() =>
                dispatchModal({
                  type: 'editChatGroupModalVisible',
                  value: false,
                })
              }
            />
            <EditChatGroupMembersModal
              isOpen={editMembersModalVisible}
              room={currentRoom}
              onComplete={(selectedUsersInModal) => {
                updateGroup(
                  {
                    ...currentRoom,
                    members: selectedUsersInModal,
                  },
                  {
                    onSuccess: (newGroupInfo) => {
                      dispatchModal({
                        type: 'editMembersModalVisible',
                        value: false,
                      });
                      toast({
                        title: `メンバーを更新しました`,
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                      setCurrentRoom({
                        ...newGroupInfo,
                        members: selectedUsersInModal,
                      });
                    },
                    onError: () => {
                      toast({
                        title: `エラーが発生しました`,
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                    },
                  },
                );
              }}
              onClose={() =>
                dispatchModal({
                  type: 'editMembersModalVisible',
                  value: false,
                })
              }
            />
          </>
        ) : null}
        <Box
          w="100%"
          display="flex"
          flexDir="row"
          h="83vh"
          justifyContent="center">
          <>
            {!isSmallerThan768 && (
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
            )}
            {currentRoom ? (
              <ChatBox room={currentRoom} onMenuClicked={handleMenuSelected} />
            ) : !isSmallerThan768 ? (
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
            ) : null}
          </>
        </Box>
      </LayoutWithTab>
    </RoomRefetchProvider>
  );
};

export default ChatDetail;
