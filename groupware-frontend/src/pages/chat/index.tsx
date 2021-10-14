import { ScreenName } from '@/components/layout/Sidebar';
import chatStyles from '@/styles/layouts/Chat.module.scss';
import { useState } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import 'rc-checkbox/assets/index.css';
import { ChatGroup, User } from 'src/types';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { useMediaQuery } from '@chakra-ui/react';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import ChatGroupCard from '@/components/chat/ChatGroupCard';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import Head from 'next/head';
import { useRouter } from 'next/router';
import selectChatGroupModalStyles from '@/styles/components/SelectChatGroupModal.module.scss';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';

const Chat = () => {
  const router = useRouter();
  const { data: chatGroups, refetch } = useAPIGetChatGroupList();
  const { data: users } = useAPIGetUsers();
  const [createGroupWindow, setCreateGroupWindow] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<ChatGroup>>({
    name: '',
    members: [],
  });

  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: () => {
      setCreateGroupWindow(false);
      setNewGroup({ name: '', members: [] });
      refetch();
    },
  });
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const toggleUserIDs = (user: User) => {
    const isExist = newGroup.members?.filter((u) => u.id === user.id);
    if (isExist && isExist.length) {
      setNewGroup((g) => ({
        ...g,
        members: g.members?.filter((u) => u.id !== user.id),
      }));
      return;
    }
    setNewGroup((g) => ({
      ...g,
      members: g.members ? [...g.members, user] : [user],
    }));
  };

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.CHAT }}
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
            setNewGroup({});
          }}
          newGroup={newGroup}
          onChangeNewGroupName={(groupName) =>
            setNewGroup((g) => ({ ...g, name: groupName }))
          }
          toggleNewGroupMember={toggleUserIDs}
          users={users}
          createGroup={() => createGroup(newGroup)}
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
