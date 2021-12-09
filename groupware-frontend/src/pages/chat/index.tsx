import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useState } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { darkFontColor } from 'src/utils/colors';
import RoomList from '@/components/chat/RoomList';

const Chat = () => {
  const router = useRouter();
  const [isLargerTahn1024] = useMediaQuery('(min-width: 1024px)');
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { data: chatGroups, refetch } = useAPIGetChatGroupList();
  const { data: users } = useAPIGetUsers();
  const [createGroupWindow, setCreateGroupWindow] = useState(false);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.CHAT }}
      header={{
        title: 'Chat',
        rightButtonName: 'ルームを作成',
        onClickRightButton: () => setCreateGroupWindow(true),
      }}>
      <Head>
        <title>ボールド | Chat</title>
      </Head>
      {users && (
        <CreateChatGroupModal
          isOpen={createGroupWindow}
          closeModal={() => {
            setCreateGroupWindow(false);
          }}
          onSuccess={() => refetch()}
        />
      )}
      {chatGroups && isSmallerThan768 ? (
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
          {chatGroups && chatGroups.length ? (
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
          ) : (
            <Text position="absolute" top="auto" bottom="auto">
              ルームを作成するか、招待をお待ちください
            </Text>
          )}
        </Box>
      )}
    </LayoutWithTab>
  );
};

export default Chat;
