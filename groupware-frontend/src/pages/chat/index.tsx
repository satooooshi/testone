import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useState } from 'react';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { darkFontColor } from 'src/utils/colors';
import RoomList from '@/components/chat/RoomList';
import { User } from 'src/types';
import EditChatGroupMembersModal from '@/components/chat/EditChatGroupMembersModal';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';

const Chat = () => {
  const router = useRouter();
  const [isLargerTahn1024] = useMediaQuery('(min-width: 1024px)');
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [membersModal, setMembersModal] = useState(false);
  const [createGroupWindow, setCreateGroupWindow] = useState(false);
  const [isTalkRoom, setIsTalkRoom] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>();
  const { needRefetch } = useRoomRefetch();

  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: (createdData) => {
      needRefetch();
      router.push(`/chat/${createdData.id.toString()}`, undefined, {
        shallow: true,
      });
    },
  });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.CHAT }}
      header={{
        title: 'Chat',
        rightMenuName: 'ルームを作成',
        setIsTalkRoom: setIsTalkRoom,
        setMembersModal: setMembersModal,
      }}>
      <Head>
        <title>ボールド | Chat</title>
      </Head>

      <EditChatGroupMembersModal
        isOpen={membersModal}
        onClose={() => setMembersModal(false)}
        onComplete={(selected) => {
          if (isTalkRoom && selected.length === 1) {
            createGroup({ name: '', members: selected });
            setMembersModal(false);
          } else {
            setSelectedMembers(selected);
            setCreateGroupWindow(true);
          }
        }}
        isTalkRoom={isTalkRoom}
      />

      <CreateChatGroupModal
        isOpen={createGroupWindow}
        closeModal={() => {
          setCreateGroupWindow(false);
        }}
        onComplete={() => {
          setMembersModal(false);
        }}
        selectedMembers={selectedMembers || []}
      />

      {isSmallerThan768 ? (
        <>
          <Box alignSelf="center">
            <Text fontWeight="bold" color={darkFontColor} fontSize="14px">
              ルームを選択
            </Text>
          </Box>
          <Box w={'85%'}>
            <RoomList
              onClickRoom={(g) => {
                router.push(`/chat/${g.id.toString()}`, undefined, {
                  shallow: true,
                });
              }}
            />
          </Box>
        </>
      ) : null}
      {!isSmallerThan768 && (
        <Box
          w="100%"
          display="flex"
          flexDir="row"
          h="83vh"
          justifyContent="center">
          <>
            <Box w={isLargerTahn1024 ? '30%' : '40%'}>
              <RoomList
                onClickRoom={(g) => {
                  router.push(`/chat/${g.id.toString()}`, undefined, {
                    shallow: true,
                  });
                }}
              />
            </Box>

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
          </>
        </Box>
      )}
    </LayoutWithTab>
  );
};

export default Chat;
