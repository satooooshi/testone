import { SidebarScreenName } from '@/components/layout/Sidebar';
import chatStyles from '@/styles/layouts/Chat.module.scss';
import { IoSend } from 'react-icons/io5';
import { useChatReducer } from '@/hooks/chat/useChatReducer';
import { MenuValue, useModalReducer } from '@/hooks/chat/useModalReducer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { ChatGroup, ChatMessageType, User } from 'src/types';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import { useAPIGetMessages } from '@/hooks/api/chat/useAPIGetMessages';
import { useAPISendChatMessage } from '@/hooks/api/chat/useAPISendChatMessage';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { Avatar, useMediaQuery, useToast } from '@chakra-ui/react';
import { convertToRaw, EditorState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin from '@draft-js-plugins/mention';
import { MentionData } from '@draft-js-plugins/mention';
import '@draft-js-plugins/mention/lib/plugin.css';
import { draftToMarkdown } from 'markdown-draft-js';
import '@draft-js-plugins/image/lib/plugin.css';
import ChatGroupCard from '@/components/chat/ChatGroupCard';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { Tab } from 'src/types/header/tab/types';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { useDropzone } from 'react-dropzone';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { isImage, isVideo } from '../../utils/indecateChatMessageType';
import SelectChatGroupModal from '@/components/chat/SelectChatGroupModal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import EditChatGroupModal from '@/components/chat/EditChatGroupModal';
import EditChatGroupMembersModal from '@/components/chat/EditChatGroupMembersModal';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useAPIGetLastReadChatTime } from '@/hooks/api/chat/useAPIGetLastReadChatTime';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import ChatMessageItem from '@/components/chat/ChatMessageItem';
import { useAPILeaveChatRoom } from '@/hooks/api/chat/useAPILeaveChatRoomURL';
import { useMention } from '@/hooks/chat/useMention';

const ChatDetail = () => {
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [{ popup, suggestions, mentionedUserData }, dispatchMention] =
    useMention();
  const [
    { page, messages, lastReadChatTime, newChatMessage, editorState },
    dispatchChat,
  ] = useChatReducer();
  const [
    {
      editChatGroupModalVisible,
      createGroupWindow,
      selectChatGroupWindow,
      editMembersModalVisible,
    },
    dispatchModal,
  ] = useModalReducer();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [resetFormTrigger, setResetFormTrigger] = useState(false);
  const { data: chatGroups, refetch: refetchGroups } = useAPIGetChatGroupList();
  const { data: users } = useAPIGetUsers();
  const { data: lastestLastReadChatTime } = useAPIGetLastReadChatTime(
    newChatMessage.chatGroup ? newChatMessage.chatGroup.id : 0,
    { refetchInterval: 1000 },
  );
  const { data: fetchedMessage } = useAPIGetMessages({
    group: newChatMessage.chatGroup ? newChatMessage.chatGroup.id : 0,
    page: page.toString(),
  });
  const { data: latestMessage, isLoading: isLoadingLatestMsg } =
    useAPIGetMessages(
      {
        group: Number(id),
        page: '1',
      },
      { refetchInterval: 1000 },
    );
  const editorRef = useRef<Editor>(null);
  const messageWrapperDivRef = useRef<HTMLDivElement | null>(null);
  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: () => {
      dispatchModal({ type: 'createGroupWindow', value: false });
      setResetFormTrigger(true);
      refetchGroups();
      toast({
        description: 'チャットルームの作成が完了しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const { mutate: saveGroup } = useAPISaveChatGroup({
    onSuccess: (newInfo) => {
      dispatchModal({ type: 'editChatGroupModalVisible', value: false });
      dispatchChat({
        type: 'newChatMessage',
        value: { ...newChatMessage, chatGroup: newInfo },
      });
      refetchGroups();
    },
  });

  const { mutate: sendChatMessage } = useAPISendChatMessage({
    onSuccess: (data) => {
      refetchGroups();
      dispatchChat({
        type: 'newChatMessage',
        value: { ...newChatMessage, content: '' },
      });
      if (!isLoadingLatestMsg) {
        if (messages.length && messages[messages.length - 1].id !== data.id) {
          messages.unshift(data);
        }
        dispatchChat({ type: 'messages', value: messages });
      }
      dispatchChat({
        type: 'editorState',
        value: EditorState.createEmpty(),
      });
      messageWrapperDivRef.current &&
        messageWrapperDivRef.current.scrollTo({ top: 0 });
    },
  });

  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime({});
  const { mutate: leaveChatGroup } = useAPILeaveChatRoom({
    onSuccess: () => {
      router.push('/chat');
    },
  });

  const { getRootProps: getRootProps, getInputProps: getInputProps } =
    useDropzone({
      noDrag: true,
      onDrop: (f) => uploadFiles(f),
    });

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'chatDetail',
    router,
    isSmallerThan768,
  });

  const { mutate: uploadFiles } = useAPIUploadStorage({
    onSuccess: (fileURLs) => {
      sendChatMessage({
        content: fileURLs[0],
        chatGroup: newChatMessage.chatGroup,
        type: isImage(fileURLs[0])
          ? ChatMessageType.IMAGE
          : isVideo(fileURLs[0])
          ? ChatMessageType.VIDEO
          : ChatMessageType.OTHER_FILE,
      });
      messageWrapperDivRef.current &&
        messageWrapperDivRef.current.scrollTo({ top: 0 });
    },
  });
  const isExist = useMemo(() => {
    if (id) {
      return chatGroups?.filter((g) => g.id.toString() === id);
    }
  }, [id, chatGroups]);

  useEffect(() => {
    if (isExist?.length) {
      dispatchChat({
        type: 'newChatMessage',
        value: { ...newChatMessage, chatGroup: isExist[0] },
      });
      saveLastReadChatTime(isExist[0].id);
    }
  }, [isExist]);

  useEffect(() => {
    dispatchChat({
      type: 'lastReadChatTime',
      value: lastestLastReadChatTime,
    });
  }, [lastestLastReadChatTime]);

  useEffect(() => {
    dispatchMention({
      type: 'allMentionUserData',
      value: newChatMessage?.chatGroup?.members,
    });
  }, [newChatMessage?.chatGroup?.members]);

  //append new message to array
  useEffect(() => {
    dispatchChat({ type: 'latestMessages', value: latestMessage });
  }, [latestMessage]);

  useEffect(() => {
    dispatchChat({ type: 'fetchedMessages', value: fetchedMessage });
  }, [fetchedMessage]);

  const onChange = (newState: EditorState) => {
    dispatchChat({ type: 'editorState', value: newState });
    const content = newState.getCurrentContent();
    const rawObject = convertToRaw(content);
    const markdownString = draftToMarkdown(rawObject);
    dispatchChat({
      type: 'newChatMessage',
      value: { ...newChatMessage, content: markdownString },
    });
  };

  const onOpenChange = useCallback(
    (_open: boolean) => {
      dispatchMention({ type: 'popup', value: _open });
    },
    [dispatchMention],
  );

  const onSearchChange = useCallback(
    ({ value }: { value: string }) => {
      dispatchMention({
        type: 'suggestions',
        value,
      });
    },
    [dispatchMention],
  );

  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map((m) => m.lastName + m.firstName).toString();
    if (strMembers.length > 15) {
      return strMembers.slice(0, 15) + '...(' + (members.length || 0) + ')';
    }
    return strMembers.toString();
  };

  const toggleChatGroups = (selectGroup: ChatGroup) => {
    dispatchChat({
      type: 'newChatMessage',
      value: { ...newChatMessage, chatGroup: selectGroup },
    });
    dispatchModal({ type: 'selectChatGroupWindow', value: false });
  };

  const onSend = () => {
    if (newChatMessage.content) {
      let parsedMessage = newChatMessage.content;
      for (const m of mentionedUserData) {
        const regexp = new RegExp(`\\s${m.name}|^${m.name}`, 'g');
        parsedMessage = parsedMessage.replace(regexp, `@[${m.name}](${m.id})`);
      }
      sendChatMessage({
        ...newChatMessage,
        content: parsedMessage,
      });
    }
  };

  const onAddMention = useCallback(
    (m: MentionData) => {
      // get the mention object selected
      dispatchMention({
        type: 'mentionedUserData',
        value: m,
      });
    },
    [dispatchMention],
  );

  const onScrollTopOnChat = (e: any) => {
    if (
      e.target.clientHeight - e.target.scrollTop >=
      (e.target.scrollHeight * 2) / 3
    ) {
      if (fetchedMessage?.length) {
        dispatchChat({ type: 'page', value: page + 1 });
      }
    }
  };

  const handleMenuSelected = (e: any) => {
    const value = e.value as MenuValue;
    if (value === 'editMembers') {
      dispatchModal({
        type: 'editMembersModalVisible',
        value: true,
      });
      return;
    }
    if (value === 'editGroup') {
      dispatchModal({
        type: 'editChatGroupModalVisible',
        value: true,
      });
      return;
    }
    if (value === 'leaveRoom') {
      if (confirm('このルームを退室してよろしいですか？')) {
        leaveChatGroup({ id: Number(id) });
      }
      return;
    }
  };

  return (
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
      {users && (
        <CreateChatGroupModal
          isOpen={createGroupWindow}
          users={users}
          resetFormTrigger={resetFormTrigger}
          setResetFormTrigger={setResetFormTrigger}
          closeModal={() => {
            dispatchModal({ type: 'createGroupWindow', value: false });
          }}
          createGroup={(g) => createGroup(g)}
        />
      )}
      {chatGroups && (
        <SelectChatGroupModal
          isOpen={selectChatGroupWindow}
          chatGroups={chatGroups}
          onClose={() =>
            dispatchModal({ type: 'selectChatGroupWindow', value: false })
          }
          selectedChatGroups={newChatMessage}
          toggleChatGroups={(group) => toggleChatGroups(group)}
        />
      )}
      <div className={chatStyles.main}>
        {chatGroups && chatGroups.length ? (
          <>
            <div className={chatStyles.groups}>
              {chatGroups ? (
                chatGroups.map((g) => (
                  <a
                    onClick={() => {
                      dispatchChat({ type: 'messages', value: [] });
                      router.push(`/chat/${g.id.toString()}`, undefined, {
                        shallow: true,
                      });
                      dispatchChat({ type: 'page', value: 1 });
                    }}
                    key={g.id}
                    style={{ marginBottom: 8 }}>
                    <ChatGroupCard
                      isSelected={newChatMessage.chatGroup?.id === g.id}
                      chatGroup={g}
                      key={g.id}
                    />
                  </a>
                ))
              ) : (
                <p>ルームを作成するか、招待をお待ちください</p>
              )}
            </div>
            <div className={chatStyles.chat}>
              {/*
               * Header
               */}
              <div className={chatStyles.chat_header}>
                <div className={chatStyles.chat_header_left}>
                  <div className={chatStyles.chat_header_avatar_wrapper}>
                    <Avatar
                      size="sm"
                      src={newChatMessage.chatGroup?.imageURL}
                    />
                  </div>
                  <p className={chatStyles.chat_header_group_name}>
                    {newChatMessage?.chatGroup?.name
                      ? newChatMessage.chatGroup.name
                      : nameOfEmptyNameGroup(
                          newChatMessage?.chatGroup?.members,
                        )}
                  </p>
                </div>
                <div className={chatStyles.chat_header_right}>
                  <Menu
                    direction="left"
                    onItemClick={handleMenuSelected}
                    menuButton={
                      <MenuButton>
                        <HiOutlineDotsCircleHorizontal size={24} />
                      </MenuButton>
                    }
                    transition>
                    <MenuItem value={'editGroup'}>
                      グループの情報を編集
                    </MenuItem>
                    <MenuItem value={'editMembers'}>メンバーを編集</MenuItem>
                    <MenuItem value={'leaveRoom'}>ルームを退室</MenuItem>
                  </Menu>
                </div>
              </div>
              {/*
               * Messages
               */}
              <div
                ref={messageWrapperDivRef}
                className={chatStyles.messages}
                onScroll={onScrollTopOnChat}>
                {messages && newChatMessage.chatGroup ? (
                  <>
                    <EditChatGroupModal
                      isOpen={editChatGroupModalVisible}
                      chatGroup={newChatMessage.chatGroup}
                      saveGroup={saveGroup}
                      closeModal={() =>
                        dispatchModal({
                          type: 'editChatGroupModalVisible',
                          value: false,
                        })
                      }
                    />
                    <EditChatGroupMembersModal
                      isOpen={editMembersModalVisible}
                      users={users || []}
                      previousUsers={newChatMessage.chatGroup.members || []}
                      onCancel={() =>
                        dispatchModal({
                          type: 'editMembersModalVisible',
                          value: false,
                        })
                      }
                      onComplete={(newMembers) => {
                        saveGroup({
                          ...newChatMessage.chatGroup,
                          members: newMembers,
                        });
                        dispatchModal({
                          type: 'editMembersModalVisible',
                          value: false,
                        });
                      }}
                    />
                    {messages.map((m) => (
                      <ChatMessageItem
                        key={m.id}
                        message={m}
                        lastReadChatTime={lastReadChatTime}
                      />
                    ))}
                  </>
                ) : (
                  <div className={chatStyles.empty_meesages_wrapper}>
                    <p className={chatStyles.empty_message}>
                      このルームは存在しないか権限がありません
                    </p>
                  </div>
                )}
              </div>
              <div
                className={chatStyles.editor}
                onClick={() => {
                  editorRef.current?.focus();
                }}>
                <Editor
                  editorKey={'editor'}
                  placeholder="メッセージを入力"
                  editorState={editorState}
                  onChange={onChange}
                  plugins={plugins}
                  ref={editorRef}
                />
                <MentionSuggestions
                  open={popup}
                  onOpenChange={onOpenChange}
                  suggestions={suggestions}
                  onSearchChange={onSearchChange}
                  onAddMention={onAddMention}
                />
              </div>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <AiOutlinePaperClip
                  size={20}
                  className={chatStyles.clip_icon}
                />
              </div>

              <IoSend
                size={20}
                onClick={onSend}
                className={chatStyles.send_icon}
              />
            </div>
          </>
        ) : (
          <p className={chatStyles.empty_group_message}>
            ルームを作成するか、招待をお待ちください
          </p>
        )}
      </div>
    </LayoutWithTab>
  );
};

export default ChatDetail;
