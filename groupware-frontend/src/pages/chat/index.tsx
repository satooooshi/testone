import { SidebarScreenName } from '@/components/layout/Sidebar';
import chatStyles from '@/styles/layouts/Chat.module.scss';
import { useState } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { Box, Text, useMediaQuery, useToast, Link } from '@chakra-ui/react';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import ChatGroupCard from '@/components/chat/ChatGroupCard';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { darkFontColor } from 'src/utils/colors';

const Chat = () => {
  const router = useRouter();
  const toast = useToast();
  const [isLargerTahn1024] = useMediaQuery('(min-width: 1024px)');
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { data: chatGroups, refetch } = useAPIGetChatGroupList();
  const { data: users } = useAPIGetUsers();
  const [createGroupWindow, setCreateGroupWindow] = useState(false);
  const [resetFormTrigger, setResetFormTrigger] = useState(false);
  const [groupImageURL, setGroupImageURL] = useState('');

  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: (data) => {
      setCreateGroupWindow(false);
      setResetFormTrigger(true);
      groupImageURL && setGroupImageURL('');
      refetch();
      toast({
        description: 'チャットルームの作成が完了しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/chat/${data.id.toString()}`, undefined, {
        shallow: true,
      });
    },
  });

  const { mutate: uploadImage } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      setGroupImageURL(fileURLs[0]);
    },
  });

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
          users={users}
          resetFormTrigger={resetFormTrigger}
          groupImageURL={groupImageURL}
          setResetFormTrigger={setResetFormTrigger}
          closeModal={() => {
            setCreateGroupWindow(false);
          }}
          createGroup={(g) => createGroup({ ...g, imageURL: groupImageURL })}
          uploadImage={(r) => uploadImage(r)}
        />
      )}
      {chatGroups && isSmallerThan768 ? (
        <>
          <Box alignSelf="center">
            <Text fontWeight="bold" color={darkFontColor} fontSize="14px">
              ルームを選択
            </Text>
          </Box>
          <div className={chatStyles.groups_responsive}>
            {chatGroups.map((g) => (
              <a
                key={g.id}
                style={{ marginBottom: 8 }}
                onClick={() =>
                  router.push(`/chat/${g.id.toString()}`, undefined, {
                    shallow: true,
                  })
                }>
                <ChatGroupCard chatGroup={g} key={g.id} />
              </a>
            ))}
          </div>
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
              <Box
                display={'flex'}
                flexDir="column"
                alignItems="center"
                h="100%"
                overflow="scroll"
                w={isLargerTahn1024 ? '30%' : '40%'}>
                {chatGroups ? (
                  chatGroups.map((g) => (
                    <Link
                      onClick={() =>
                        router.push(`/chat/${g.id.toString()}`, undefined, {
                          shallow: true,
                        })
                      }
                      key={g.id}
                      mb={'8px'}>
                      <ChatGroupCard chatGroup={g} key={g.id} />
                    </Link>
                  ))
                ) : (
                  <Text>ルームを作成するか、招待をお待ちください</Text>
                )}
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
