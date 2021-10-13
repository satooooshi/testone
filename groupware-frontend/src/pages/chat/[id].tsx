import { ScreenName } from '@/components/Sidebar';
import chatStyles from '@/styles/layouts/Chat.module.scss';
import { IoSend } from 'react-icons/io5';
import clsx from 'clsx';
import { EventHandler, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import 'rc-checkbox/assets/index.css';
import { ChatGroup, ChatMessage, ChatMessageType, User } from 'src/types';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import { useAPIGetMessages } from '@/hooks/api/chat/useAPIGetMessages';
import { useAPISendChatMessage } from '@/hooks/api/chat/useAPISendChatMessage';
import { useChatReducer } from '@/hooks/chat/useChatReducer';
import { mentionTransform } from 'src/utils/mentionTransform';
import CreateChatGroupModal from '@/components/CreateChatGroupModal';
import { Avatar, useMediaQuery } from '@chakra-ui/react';
import { convertToRaw, EditorState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createMentionPlugin from '@draft-js-plugins/mention';
import { MentionData } from '@draft-js-plugins/mention';
import '@draft-js-plugins/mention/lib/plugin.css';
import { draftToMarkdown } from 'markdown-draft-js';
import '@draft-js-plugins/image/lib/plugin.css';
import ChatGroupCard from '@/components/ChatGroupCard';
import LayoutWithTab from '@/components/LayoutWithTab';
import { Tab } from 'src/types/header/tab/types';
import { AiOutlinePaperClip, AiOutlineFileProtect } from 'react-icons/ai';
import { useDropzone } from 'react-dropzone';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { isImage, isVideo } from '../../utils/indecateChatMessageType';
import SelectChatGroupModal from '@/components/SelectChatGroupModal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import { Menu, MenuItem, MenuButton, MenuItemProps } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import Link from 'next/link';
import EditChatGroupModal from '@/components/EditChatGroupModal';
import EditChatGroupMembersModal from '@/components/EditChatGroupMembersModal';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useAPIGetLastReadChatTime } from '@/hooks/api/chat/useAPIGetLastReadChatTime';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useMentionReducer } from '@/hooks/chat/useMentionReducer';

const ChatDetail = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [{ popup, suggestions, mentionedUserData }, dispatchMention] =
    useMentionReducer({
      popup: false,
      suggestions: [],
      allMentionUserData: [],
      mentionedUserData: [],
    });
  const [
    {
      page,
      editChatGroupModalVisible,
      messages,
      lastReadChatTime,
      newChatMessage,
      createGroupWindow,
      selectChatGroupWindow,
      editMembersModalVisible,
      newGroup,
      editorState,
    },
    dispatchChat,
  ] = useChatReducer();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { data: chatGroups, refetch } = useAPIGetChatGroupList();
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
      dispatchChat({ type: 'createGroupWindow', value: false });
      dispatchChat({ type: 'newGroup', value: { ...newGroup, members: [] } });
      refetch();
    },
  });

  const { mutate: saveGroup } = useAPISaveChatGroup({
    onSuccess: (newInfo) => {
      dispatchChat({ type: 'editChatGroupModalVisible', value: false });
      dispatchChat({
        type: 'newChatMessage',
        value: { ...newChatMessage, chatGroup: newInfo },
      });
      refetch();
    },
  });

  const { mutate: sendChatMessage } = useAPISendChatMessage({
    onSuccess: (data) => {
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
        messageWrapperDivRef.current.scrollIntoView();
    },
  });

  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime({});

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
        messageWrapperDivRef.current.scrollIntoView();
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

  const onOpenChange = useCallback((_open: boolean) => {
    dispatchMention({ type: 'popup', value: _open });
  }, []);

  const onSearchChange = useCallback(({ value }: { value: string }) => {
    dispatchMention({
      type: 'suggestions',
      value,
    });
  }, []);

  const messageReadCount = (message: ChatMessage): number => {
    return lastReadChatTime?.filter((l) => l.readTime >= message.updatedAt)
      .length;
  };

  const toggleUserIDs = (user: User) => {
    const isExist = newGroup.members?.filter((u) => u.id === user.id);
    if (isExist && isExist.length) {
      dispatchChat({
        type: 'newGroup',
        value: {
          ...newGroup,
          members: newGroup.members?.filter((u) => u.id !== user.id),
        },
      });
      return;
    }
    dispatchChat({
      type: 'newGroup',
      value: {
        ...newGroup,
        members: newGroup.members ? [...newGroup.members, user] : [user],
      },
    });
  };

  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map((m) => m.lastName + m.firstName).toString();
    if (strMembers.length > 15) {
      return strMembers.slice(0, 15) + '...(' + members.length + ')';
    }
    return strMembers.toString();
  };

  const toggleChatGroups = (selectGroup: ChatGroup) => {
    dispatchChat({
      type: 'newChatMessage',
      value: { ...newChatMessage, chatGroup: selectGroup },
    });
    dispatchChat({ type: 'selectChatGroupWindow', value: false });
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

  const onAddMention = useCallback((m: MentionData) => {
    // get the mention object selected
    dispatchMention({
      type: 'mentionedUserData',
      value: m,
    });
  }, []);

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

  const handleMenuSelected = useCallback((e: MenuItemProps) => {
    dispatchChat({ type: 'handleMenuSelected', value: e.value });
  },[]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.CHAT }}
      header={{
        title: 'Chat',
        tabs: tabs,
        rightButtonName: 'ルームを作成',
        onClickRightButton: () =>
          dispatchChat({ type: 'createGroupWindow', value: true }),
      }}>
      <Head>
        <title>ボールド | Chat</title>
      </Head>
      {users && (
        <CreateChatGroupModal
          isOpen={createGroupWindow}
          closeModal={() => {
            dispatchChat({ type: 'createGroupWindow', value: false });
            dispatchChat({ type: 'newGroup', value: {} });
          }}
          newGroup={newGroup}
          onChangeNewGroupName={(groupName) =>
            dispatchChat({
              type: 'newGroup',
              value: { ...newGroup, name: groupName },
            })
          }
          toggleNewGroupMember={toggleUserIDs}
          users={users}
          createGroup={(g) => createGroup(g)}
        />
      )}
      {chatGroups && (
        <SelectChatGroupModal
          isOpen={selectChatGroupWindow}
          chatGroups={chatGroups}
          onClose={() =>
            dispatchChat({ type: 'selectChatGroupWindow', value: false })
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
                    {`(${newChatMessage.chatGroup?.members?.length})`}
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
                  </Menu>
                </div>
              </div>
              {/*
               * Messages
               */}
              <div className={chatStyles.messages} onScroll={onScrollTopOnChat}>
                {messages && newChatMessage.chatGroup ? (
                  <>
                    <EditChatGroupModal
                      isOpen={editChatGroupModalVisible}
                      chatGroup={newChatMessage.chatGroup}
                      saveGroup={saveGroup}
                      closeModal={() =>
                        dispatchChat({
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
                        dispatchChat({
                          type: 'editMembersModalVisible',
                          value: false,
                        })
                      }
                      onComplete={(newMembers) => {
                        saveGroup({
                          ...newChatMessage.chatGroup,
                          members: newMembers,
                        });
                        dispatchChat({
                          type: 'editMembersModalVisible',
                          value: false,
                        });
                      }}
                    />
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={clsx(
                          chatStyles.message__item,
                          m.isSender
                            ? chatStyles.message__self
                            : chatStyles.message__other,
                        )}>
                        {!m.isSender ? (
                          <Link href={`/account/${m.sender?.id}`} passHref>
                            <Avatar
                              className={chatStyles.group_card_avatar_image}
                              src={m.sender?.avatarUrl}
                            />
                          </Link>
                        ) : null}
                        <div
                          className={chatStyles.message_wrapper}
                          ref={messageWrapperDivRef}>
                          {m.isSender && (
                            <div>
                              {messageReadCount(m) ? (
                                <p className={chatStyles.read_count}>
                                  既読
                                  {messageReadCount(m)}
                                </p>
                              ) : null}
                              <p className={chatStyles.send_time}>
                                {dateTimeFormatterFromJSDDate({
                                  dateTime: new Date(m.createdAt),
                                  format: 'HH:mm',
                                })}
                              </p>
                            </div>
                          )}
                          <div
                            className={clsx(
                              chatStyles.message_user_info_wrapper,
                              m.isSender &&
                                chatStyles.message_user_info_wrapper__self,
                            )}>
                            <p className={chatStyles.massage_sender_name}>
                              {m.sender?.lastName + ' ' + m.sender?.firstName}
                            </p>
                            {m.type === ChatMessageType.TEXT ? (
                              <p
                                className={clsx(
                                  chatStyles.message_content,
                                  m.isSender
                                    ? chatStyles.message_text__self
                                    : chatStyles.message_text__other,
                                )}>
                                {mentionTransform(m.content)}
                              </p>
                            ) : (
                              <span className={chatStyles.message_content}>
                                {m.type === ChatMessageType.IMAGE ? (
                                  <span
                                    className={
                                      chatStyles.message_image_or_video
                                    }>
                                    <img
                                      src={m.content}
                                      width={300}
                                      height={300}
                                      alt="image"
                                    />
                                  </span>
                                ) : m.type === ChatMessageType.VIDEO ? (
                                  <span
                                    className={
                                      chatStyles.message_image_or_video
                                    }>
                                    <video
                                      src={m.content}
                                      controls
                                      width={300}
                                      height={300}
                                    />
                                  </span>
                                ) : (
                                  <div
                                    className={chatStyles.message_other_file}>
                                    <AiOutlineFileProtect
                                      className={chatStyles.other_file_icon}
                                    />
                                    <span>
                                      {
                                        (m.content.match(
                                          '.+/(.+?)([?#;].*)?$',
                                        ) || ['', m.content])[1]
                                      }
                                    </span>
                                  </div>
                                )}
                              </span>
                            )}
                          </div>
                          {!m.isSender && (
                            <p className={chatStyles.send_time}>
                              {dateTimeFormatterFromJSDDate({
                                dateTime: new Date(m.createdAt),
                                format: 'HH:mm',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
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
