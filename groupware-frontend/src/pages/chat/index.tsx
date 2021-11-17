import { SidebarScreenName } from '@/components/layout/Sidebar';
import chatStyles from '@/styles/layouts/Chat.module.scss';
import { useState } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { useMediaQuery, useToast } from '@chakra-ui/react';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import ChatGroupCard from '@/components/chat/ChatGroupCard';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import Head from 'next/head';
import { useRouter } from 'next/router';
import selectChatGroupModalStyles from '@/styles/components/SelectChatGroupModal.module.scss';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';

const Chat = () => {
  const router = useRouter();
  const toast = useToast();
  const { data: chatGroups, refetch } = useAPIGetChatGroupList();
  const { data: users } = useAPIGetUsers();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [createGroupWindow, setCreateGroupWindow] = useState(false);
  const [resetFormTrigger, setResetFormTrigger] = useState(false);

  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: () => {
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
    },
  });
  const [groupImageURL, setGroupImageURL] = useState('');
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
          setResetFormTrigger={setResetFormTrigger}
          closeModal={() => {
            setCreateGroupWindow(false);
          }}
          createGroup={(g) => createGroup({ ...g, imageURL: groupImageURL })}
          uploadImage={(r) => uploadImage(r)}
          groupImageURL={groupImageURL}
        />
      )}
      {chatGroups && isSmallerThan768 ? (
        <>
          <div className={selectChatGroupModalStyles.title_wrapper}>
            <p className={selectChatGroupModalStyles.title}>ルームを選択</p>
          </div>
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
        <div className={chatStyles.main}>
          {chatGroups && chatGroups.length ? (
            <>
              <div className={chatStyles.groups}>
                {chatGroups ? (
                  chatGroups.map((g) => (
                    <a
                      onClick={() =>
                        router.push(`/chat/${g.id.toString()}`, undefined, {
                          shallow: true,
                        })
                      }
                      key={g.id}
                      style={{ marginBottom: 8 }}>
                      <ChatGroupCard chatGroup={g} key={g.id} />
                    </a>
                  ))
                ) : (
                  <p>ルームを作成するか、招待をお待ちください</p>
                )}
              </div>
              <div className={chatStyles.empty_group_window}>
                <p className={chatStyles.empty_group_message}>
                  ルームを選択してください
                </p>
              </div>
            </>
          ) : (
            <p className={chatStyles.empty_group_message}>
              ルームを作成するか、招待をお待ちください
            </p>
          )}
        </div>
      )}
    </LayoutWithTab>
  );
};

export default Chat;
