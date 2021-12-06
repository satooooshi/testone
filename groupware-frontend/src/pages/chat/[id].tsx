import { SidebarScreenName } from '@/components/layout/Sidebar';
import { MenuValue, useModalReducer } from '@/hooks/chat/useModalReducer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import {
  ChatAlbum,
  ChatAlbumImage,
  ChatGroup,
  ChatMessage,
  ChatMessageType,
} from 'src/types';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import { useAPIGetMessages } from '@/hooks/api/chat/useAPIGetMessages';
import { useAPISendChatMessage } from '@/hooks/api/chat/useAPISendChatMessage';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { useMediaQuery, useToast, Box, Link } from '@chakra-ui/react';
import { convertToRaw, EditorState } from 'draft-js';
import { MentionData } from '@draft-js-plugins/mention';
import '@draft-js-plugins/mention/lib/plugin.css';
import { draftToMarkdown } from 'markdown-draft-js';
import '@draft-js-plugins/image/lib/plugin.css';
import ChatGroupCard from '@/components/chat/ChatGroupCard';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { Tab } from 'src/types/header/tab/types';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { isImage, isVideo } from '../../utils/indecateChatMessageType';
import SelectChatGroupModal from '@/components/chat/SelectChatGroupModal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import EditChatGroupModal from '@/components/chat/EditChatGroupModal';
import EditChatGroupMembersModal from '@/components/chat/EditChatGroupMembersModal';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useAPIGetLastReadChatTime } from '@/hooks/api/chat/useAPIGetLastReadChatTime';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useAPILeaveChatRoom } from '@/hooks/api/chat/useAPILeaveChatRoomURL';
import { useMention } from '@/hooks/chat/useMention';
import ChatBox from '@/components/chat/ChatBox';
import { useAPIGetChatAlbums } from '@/hooks/api/chat/album/useAPIGetAlbums';
import AlbumModal from '@/components/chat/AlbumModal';
import { useAPIGetChatAlbumImages } from '@/hooks/api/chat/album/useAPIGetChatAlbumImages';
import { useAPIUpdateAlbum } from '@/hooks/api/chat/album/useAPIUpdateChatAlbum';
import { useAPISaveAlbumImage } from '@/hooks/api/chat/album/useAPISaveChatImages';

const ChatDetail = () => {
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [{ popup, suggestions, mentionedUserData }, dispatchMention] =
    useMention();
  const [page, setPage] = useState(1);
  const [newChatMessage, setNewChatMessage] = useState<Partial<ChatMessage>>({
    content: '',
    type: ChatMessageType.TEXT,
  });
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
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
  const [albumListPage, setAlbumListPage] = useState(1);
  const [albumImageListPage, setAlbumImageListPage] = useState(1);
  const { data: albums } = useAPIGetChatAlbums({
    roomId: id,
    page: albumListPage.toString(),
  });
  const [selectedAlbum, setSelectedAlbum] = useState<ChatAlbum>();
  const [albumImages, setAlbumImages] = useState<ChatAlbumImage[]>([]);
  useAPIGetChatAlbumImages(
    {
      roomId: id,
      albumId: selectedAlbum?.id.toString() || '0',
      page: albumImageListPage.toString(),
    },
    {
      onSuccess: (data) => {
        setAlbumImages((existImage) => {
          if (existImage.length) {
            return [...existImage, ...data.images];
          }
          return data?.images || [];
        });
      },
    },
  );
  const [visibleAlbumModal, setVisibleAlbumModal] = useState(false);
  const [visibleNoteModal, setVisibleNoteModal] = useState(false);
  const [resetFormTrigger, setResetFormTrigger] = useState(false);
  const [groupImageURL, setGroupImageURL] = useState('');
  const { data: chatGroups, refetch: refetchGroups } = useAPIGetChatGroupList();
  const { data: users } = useAPIGetUsers();
  const { data: lastReadChatTime } = useAPIGetLastReadChatTime(
    newChatMessage.chatGroup ? newChatMessage.chatGroup.id : 0,
    { refetchInterval: 1000 },
  );
  const [isLargerTahn1024] = useMediaQuery('(min-width: 1024px)');
  const { data: fetchedPastMessages } = useAPIGetMessages({
    group: newChatMessage.chatGroup ? newChatMessage.chatGroup.id : 0,
    page: page.toString(),
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { data: latestMessage, isLoading: isLoadingLatestMsg } =
    useAPIGetMessages(
      {
        group: Number(id),
        page: '1',
      },
      { refetchInterval: 1000 },
    );
  const messageWrapperDivRef = useRef<HTMLDivElement | null>(null);
  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: (data) => {
      dispatchModal({ type: 'createGroupWindow', value: false });
      setResetFormTrigger(true);
      groupImageURL && setGroupImageURL('');
      refetchGroups();
      toast({
        description: 'チャットルームの作成が完了しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setMessages([]);
      router.push(`/chat/${data.id.toString()}`, undefined, {
        shallow: true,
      });
      setPage(1);
    },
  });

  const { mutate: saveGroup } = useAPISaveChatGroup({
    onSuccess: (newInfo) => {
      dispatchModal({ type: 'editChatGroupModalVisible', value: false });
      setNewChatMessage((m) => ({ ...m, chatGroup: newInfo }));
      refetchGroups();
    },
  });

  const { mutate: sendChatMessage } = useAPISendChatMessage({
    onSuccess: (data) => {
      refetchGroups();
      if (!isLoadingLatestMsg) {
        if (messages.length && messages[messages.length - 1].id !== data.id) {
          messages.unshift(data);
        }
        setMessages(messages);
      }
      setNewChatMessage((m) => ({ ...m, content: '' }));
      setEditorState(EditorState.createEmpty());
      messageWrapperDivRef.current &&
        messageWrapperDivRef.current.scrollTo({ top: 0 });
    },
  });

  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime();
  const { mutate: leaveChatGroup } = useAPILeaveChatRoom({
    onSuccess: () => {
      router.push('/chat');
    },
  });

  const { mutate: uploadImage } = useAPIUploadStorage();
  const { mutate: saveAlbumImage } = useAPISaveAlbumImage();

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
  const focusedGroup = useMemo(() => {
    if (id) {
      return chatGroups?.filter((g) => g.id.toString() === id);
    }
  }, [id, chatGroups]);

  useEffect(() => {
    if (focusedGroup?.length) {
      setNewChatMessage((m) => ({ ...m, chatGroup: focusedGroup[0] }));
      saveLastReadChatTime(focusedGroup[0].id);
    }
  }, [focusedGroup, saveLastReadChatTime]);

  const isRecent = (created: ChatMessage, target: ChatMessage): boolean => {
    if (new Date(created.createdAt) > new Date(target.createdAt)) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (latestMessage?.length && messages?.length) {
      const msgToAppend: ChatMessage[] = [];
      for (const sentMsg of latestMessage) {
        if (isRecent(sentMsg, messages[0])) {
          msgToAppend.unshift(sentMsg);
        }
      }
      setMessages((m) => {
        return [...msgToAppend, ...m];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestMessage]);

  useEffect(() => {
    if (fetchedPastMessages?.length) {
      if (
        messages?.length &&
        isRecent(
          messages[messages.length - 1],
          fetchedPastMessages[fetchedPastMessages.length - 1],
        )
      ) {
        setMessages((m) => {
          return [...m, ...fetchedPastMessages];
        });
      } else if (!messages?.length) {
        setMessages(fetchedPastMessages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedPastMessages]);

  useEffect(() => {
    dispatchMention({
      type: 'allMentionUserData',
      value: newChatMessage?.chatGroup?.members,
    });
  }, [dispatchMention, newChatMessage?.chatGroup?.members]);

  const onChange = (newState: EditorState) => {
    setEditorState(newState);
    const content = newState.getCurrentContent();
    const rawObject = convertToRaw(content);
    const markdownString = draftToMarkdown(rawObject);
    setNewChatMessage((m) => ({ ...m, content: markdownString }));
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

  const toggleChatGroups = (selectGroup: ChatGroup) => {
    setNewChatMessage((m) => ({ ...m, chatGroup: selectGroup }));
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
      if (fetchedPastMessages?.length) {
        setPage((p) => p + 1);
      }
    }
  };

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

      <AlbumModal
        isOpen={visibleAlbumModal}
        onClose={() => setVisibleAlbumModal(false)}
        headerName="アルバム一覧"
        albums={albums?.albums || []}
        images={albumImages}
        selectedAlbum={selectedAlbum}
        onClickAlbum={(album) => setSelectedAlbum(album)}
        onClickBackButton={() => {
          setSelectedAlbum(undefined);
          setAlbumImages([]);
        }}
        onUploadImage={(files) => {
          uploadImage(files, {
            onSuccess: (imageURLs) => {
              if (selectedAlbum) {
                const albumImages: Partial<ChatAlbumImage>[] = imageURLs.map(
                  (i) => ({ imageURL: i, chatAlbum: selectedAlbum }),
                );
                saveAlbumImage(albumImages, {
                  onSuccess: (savedImages) => {
                    setSelectedAlbum({
                      ...selectedAlbum,
                      images: selectedAlbum?.images?.length
                        ? [...savedImages, ...selectedAlbum.images]
                        : [...savedImages],
                    });
                  },
                });
              }
            },
          });
        }}
      />
      {users && (
        <CreateChatGroupModal
          isOpen={createGroupWindow}
          users={users}
          resetFormTrigger={resetFormTrigger}
          groupImageURL={groupImageURL}
          setResetFormTrigger={setResetFormTrigger}
          closeModal={() => {
            dispatchModal({ type: 'createGroupWindow', value: false });
          }}
          createGroup={(g) => createGroup({ ...g, imageURL: groupImageURL })}
          uploadImage={(r) =>
            uploadImage(r, {
              onSuccess: async (fileURLs) => {
                setGroupImageURL(fileURLs[0]);
              },
            })
          }
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
        </>
      ) : null}
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
                    <ChatGroupCard
                      isSelected={newChatMessage.chatGroup?.id === g.id}
                      chatGroup={g}
                      key={g.id}
                    />
                  </Link>
                ))
              ) : (
                <p>ルームを作成するか、招待をお待ちください</p>
              )}
            </Box>
            {newChatMessage.chatGroup && (
              <ChatBox
                onClickNoteIcon={() => setVisibleNoteModal(true)}
                onClickAlbumIcon={() => setVisibleAlbumModal(true)}
                room={newChatMessage.chatGroup}
                onMenuClicked={handleMenuSelected}
                onScrollTopOnChat={onScrollTopOnChat}
                messages={messages}
                onSend={onSend}
                suggestions={suggestions}
                lastReadChatTime={lastReadChatTime || []}
                editorState={editorState}
                onEditorChange={onChange}
                onUploadFile={(f) => uploadFiles(f)}
                popupOpened={popup}
                onSuggestionOpenChange={onOpenChange}
                editorSuggestions={suggestions}
                onSuggestionSearchChange={onSearchChange}
                onAddMention={onAddMention}
              />
            )}
          </>
        ) : (
          <Box position="absolute" top="auto" bottom="auto">
            ルームを作成するか、招待をお待ちください
          </Box>
        )}
      </Box>
    </LayoutWithTab>
  );
};

export default ChatDetail;
