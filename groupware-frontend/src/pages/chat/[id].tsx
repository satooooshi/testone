import { SidebarScreenName } from '@/components/layout/Sidebar';
import { MenuValue, useModalReducer } from '@/hooks/chat/useModalReducer';
import React, { useState } from 'react';
import { ChatGroup, ChatMessage } from 'src/types';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import {
  useMediaQuery,
  Box,
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
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
import { Picker } from 'emoji-mart';
import { useAPISaveReaction } from '@/hooks/api/chat/useAPISaveReaction';
import RoomList from '@/components/chat/RoomList';
import { useAPIUpdateChatGroup } from '@/hooks/api/chat/useAPIUpdateChatGroup';
import { RoomRefetchProvider } from 'src/contexts/chat/useRoomRefetch';

const ChatDetail = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { mutate: saveReaction } = useAPISaveReaction();
  const [selectedMsgForReaction, setSelectedMsgForReaction] =
    useState<ChatMessage>();
  const [currentRoom, setCurrentRoom] = useState<ChatGroup>();
  const [
    { editChatGroupModalVisible, createGroupWindow, editMembersModalVisible },
    dispatchModal,
  ] = useModalReducer();
  const { mutate: updateGroup } = useAPIUpdateChatGroup();
  const toast = useToast();

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
        <Modal
          isOpen={!!selectedMsgForReaction}
          onClose={() => setSelectedMsgForReaction(undefined)}>
          <ModalOverlay />
          <ModalContent h="90vh" bg={'#f9fafb'}>
            <ModalHeader>リアクションを選択</ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" flexDir="row" justifyContent="center">
              <Picker
                title=""
                emoji="point_up"
                skin={1}
                defaultSkin={1}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore for Android suport
                emojisToShowFilter={(e) => parseFloat(e['added_in']) <= 6}
                onSelect={(emoji) => {
                  saveReaction({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    emoji: emoji?.native,
                    chatMessage: selectedMsgForReaction,
                  });
                  setSelectedMsgForReaction(undefined);
                }}
                i18n={{
                  search: '検索',
                  categories: {
                    search: '検索結果',
                    recent: 'よく使われる絵文字',
                    people: '顔 & 人',
                    nature: '動物 & 自然',
                    foods: '食べ物 & 飲み物',
                    activity: 'アクティビティ',
                    places: '旅行 & 場所',
                    objects: 'オブジェクト',
                    symbols: '記号',
                    flags: '旗',
                    custom: 'カスタム',
                  },
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

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
                  currentRoom={currentRoom}
                  setCurrentRoom={setCurrentRoom}
                  onClickRoom={(g) =>
                    router.push(`/chat/${g.id.toString()}`, undefined, {
                      shallow: true,
                    })
                  }
                />
              </Box>
            )}
            {currentRoom && (
              <ChatBox room={currentRoom} onMenuClicked={handleMenuSelected} />
            )}
          </>
        </Box>
      </LayoutWithTab>
    </RoomRefetchProvider>
  );
};

export default ChatDetail;
