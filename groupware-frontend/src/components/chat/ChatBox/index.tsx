import { Avatar, Box, useMediaQuery, Text, Link } from '@chakra-ui/react';
import { MentionData } from '@draft-js-plugins/mention';
import { darkFontColor } from 'src/utils/colors';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import Editor from '@draft-js-plugins/editor';
import { convertToRaw, EditorState } from 'draft-js';
import { AiOutlinePaperClip, AiOutlinePicture } from 'react-icons/ai';
import { ChatGroup, ChatMessage, ChatMessageType, User } from 'src/types';
import { MenuValue } from '@/hooks/chat/useModalReducer';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ChatMessageItem from '../ChatMessageItem';
import { IoCloseSharp, IoSend } from 'react-icons/io5';
import { FiFileText } from 'react-icons/fi';
import createMentionPlugin from '@draft-js-plugins/mention';
import { useDropzone } from 'react-dropzone';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { draftToMarkdown } from 'markdown-draft-js';
import { useMention } from '@/hooks/chat/useMention';
import { useAPIGetLastReadChatTime } from '@/hooks/api/chat/useAPIGetLastReadChatTime';
import { useAPIGetMessages } from '@/hooks/api/chat/useAPIGetMessages';
import { useAPISendChatMessage } from '@/hooks/api/chat/useAPISendChatMessage';
import { useFormik } from 'formik';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { isImage, isVideo } from 'src/utils/indecateChatMessageType';
import { mentionTransform } from 'src/utils/mentionTransform';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import dynamic from 'next/dynamic';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import UserAvatar from '@/components/common/UserAvatar';
import io from 'socket.io-client';
import { baseURL } from 'src/utils/url';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import AlbumModal from '../AlbumModal';
import NoteModal from '../NoteModal';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';

const socket = io(baseURL, {
  transports: ['websocket'],
});

type ChatBoxProps = {
  room: ChatGroup;
  onMenuClicked: (menuValue: MenuValue) => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({ room, onMenuClicked }) => {
  const { needRefetch } = useRoomRefetch();
  const [visibleAlbumModal, setVisibleAlbumModal] = useState(false);
  const [visibleNoteModal, setVisibleNoteModal] = useState(false);
  const { user: myself } = useAuthenticate();
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const {
    values: newChatMessage,
    setValues: setNewChatMessage,
    handleSubmit,
  } = useFormik<Partial<ChatMessage>>({
    initialValues: {
      content: '',
      type: ChatMessageType.TEXT,
      chatGroup: room,
    },
    enableReinitialize: true,
    onSubmit: () => onSend(),
  });
  const imagesForViewing: ImageDecorator[] = useMemo(() => {
    return messages
      .filter((m) => m.type === ChatMessageType.IMAGE)
      .map((m) => ({
        src: m.content,
        downloadUrl: m.content,
      }))
      .reverse();
  }, [messages]);
  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime();
  const [selectedImageURL, setSelectedImageURL] = useState<string>();
  const { data: lastReadChatTime } = useAPIGetLastReadChatTime(room.id, {
    refetchInterval: 1000,
  });
  const [{ popup, suggestions, mentionedUserData }, dispatchMention] =
    useMention();
  const { data: fetchedPastMessages } = useAPIGetMessages({
    group: room.id,
    page: page.toString(),
  });
  const { refetch: refetchLatest } = useAPIGetMessages(
    {
      group: room.id,
      page: '1',
    },
    {
      enabled: false,
      onSuccess: (latestData) => {
        if (latestData?.length) {
          const msgToAppend: ChatMessage[] = [];
          for (const latest of latestData) {
            if (!messages?.length || isRecent(latest, messages?.[0])) {
              msgToAppend.push(latest);
            }
          }
          if (msgToAppend.length) {
            setMessages((m) => [...msgToAppend, ...m]);
            needRefetch();
          }
        }
      },
    },
  );

  const { mutate: sendChatMessage } = useAPISendChatMessage({
    onSuccess: (data) => {
      socket.emit('message', { ...data, isSender: false });
      setTimeout(() => {
        if (data.id !== messages?.[0].id) {
          setMessages([data, ...messages]);
        }
      }, 3000);
      setNewChatMessage((m) => ({
        ...m,
        content: '',
        replyParentMessage: undefined,
      }));
      setEditorState(EditorState.createEmpty());
      messageWrapperDivRef.current &&
        messageWrapperDivRef.current.scrollTo({ top: 0 });
    },
  });

  const { mutate: uploadFiles } = useAPIUploadStorage({
    onSuccess: (fileURLs) => {
      const type = isImage(fileURLs[0])
        ? ChatMessageType.IMAGE
        : isVideo(fileURLs[0])
        ? ChatMessageType.VIDEO
        : ChatMessageType.OTHER_FILE;
      sendChatMessage({
        content: fileURLs[0],
        chatGroup: newChatMessage.chatGroup,
        type,
      });
      messageWrapperDivRef.current &&
        messageWrapperDivRef.current.scrollTo({ top: 0 });
    },
  });

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

  const onSuggestionOpenChange = useCallback(
    (_open: boolean) => {
      dispatchMention({ type: 'popup', value: _open });
    },
    [dispatchMention],
  );

  const onSuggestionSearchChange = useCallback(
    ({ value }: { value: string }) => {
      dispatchMention({
        type: 'suggestions',
        value,
      });
    },
    [dispatchMention],
  );

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
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const messageWrapperDivRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor>(null);
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const {
    getRootProps: noClickRootDropzone,
    getInputProps: noClickInputDropzone,
  } = useDropzone({
    noClick: true,
    onDrop: (f) => uploadFiles(f),
  });
  const { getRootProps: getRootProps, getInputProps } = useDropzone({
    noClick: false,
    onDrop: (f) => uploadFiles(f),
  });

  const onEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    const content = newState.getCurrentContent();
    const rawObject = convertToRaw(content);
    const markdownString = draftToMarkdown(rawObject);
    setNewChatMessage((v) => ({ ...v, content: markdownString }));
  };

  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members?.length) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map((m) => m.lastName + m.firstName).join();
    return strMembers.toString();
  };

  const isRecent = (created: ChatMessage, target: ChatMessage): boolean => {
    if (new Date(created.createdAt) > new Date(target.createdAt)) {
      return true;
    }
    return false;
  };

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

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

  useEffect(() => {
    dispatchMention({
      type: 'allMentionUserData',
      value: room?.members,
    });
  }, [dispatchMention, room]);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    refetchLatest();
  }, [refetchLatest, room]);

  useEffect(() => {
    if (fetchedPastMessages?.length) {
      if (
        messages?.length &&
        isRecent(
          messages[messages.length - 1],
          fetchedPastMessages[fetchedPastMessages.length - 1],
        )
      ) {
        const msgToAppend: ChatMessage[] = [];
        for (const sentMsg of fetchedPastMessages) {
          if (isRecent(messages[messages.length - 1], sentMsg)) {
            msgToAppend.push(sentMsg);
          }
        }
        setMessages((m) => {
          return [...m, ...msgToAppend];
        });
      } else if (!messages?.length) {
        setMessages(fetchedPastMessages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedPastMessages]);

  const readUsers = (targetMsg: ChatMessage) => {
    return lastReadChatTime
      ? lastReadChatTime
          .filter((t) => t.readTime >= targetMsg.createdAt)
          .map((t) => t.user)
      : [];
  };

  useEffect(() => {
    saveLastReadChatTime(room.id);
  }, [room.id, saveLastReadChatTime]);

  useEffect(() => {
    socket.emit('joinRoom', room.id.toString());
    socket.on('msgToClient', async (sentMsgByOtherUsers: ChatMessage) => {
      // console.log('sent by other users', sentMsgByOtherUsers.content);
      if (sentMsgByOtherUsers.content) {
        sentMsgByOtherUsers.createdAt = new Date(sentMsgByOtherUsers.createdAt);
        sentMsgByOtherUsers.updatedAt = new Date(sentMsgByOtherUsers.updatedAt);
        if (sentMsgByOtherUsers.sender?.id === myself?.id) {
          sentMsgByOtherUsers.isSender = true;
        }
        setMessages((m) => {
          return [sentMsgByOtherUsers, ...m];
        });
        needRefetch();
      }
    });

    // socket.on('joinedRoom', (r: any) => {
    //   console.log('joinedRoom', r);
    // });
    //
    // socket.on('leftRoom', (r: any) => {
    //   console.log('leftRoom', r);
    // });
    return () => {
      socket.emit('leaveRoom', room.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const activeIndex = useMemo(() => {
    if (selectedImageURL) {
      const isNowUri = (element: ImageDecorator) =>
        element.src === selectedImageURL;
      return imagesForViewing.findIndex(isNowUri);
    }
  }, [imagesForViewing, selectedImageURL]);

  const replyTargetContent = (replyTarget: ChatMessage) => {
    switch (replyTarget.type) {
      case ChatMessageType.TEXT:
        return mentionTransform(replyTarget.content);
      case ChatMessageType.IMAGE:
        return '写真';
      case ChatMessageType.VIDEO:
        return '動画';
      case ChatMessageType.OTHER_FILE:
        return 'ファイル';
    }
  };

  return (
    <Box
      {...getRootProps()}
      {...noClickRootDropzone}
      w={isSmallerThan768 ? '100%' : '60vw'}
      h="100%"
      bg="white"
      position="relative"
      borderRadius="md"
      boxShadow="md">
      <AlbumModal
        room={room}
        isOpen={visibleAlbumModal}
        onClose={() => {
          setVisibleAlbumModal(false);
          refetchLatest();
        }}
      />
      <NoteModal
        room={room}
        isOpen={visibleNoteModal}
        onClose={() => {
          setVisibleNoteModal(false);
          refetchLatest();
        }}
      />
      <input {...noClickInputDropzone()} />
      <Viewer
        customToolbar={(config) => {
          return config.concat([
            {
              key: 'donwload',
              render: (
                <i
                  className={`react-viewer-icon react-viewer-icon-download`}></i>
              ),
              onClick: ({ src }) => {
                saveAs(src);
              },
            },
          ]);
        }}
        images={imagesForViewing}
        visible={!!selectedImageURL}
        onClose={() => setSelectedImageURL(undefined)}
        activeIndex={activeIndex !== -1 ? activeIndex : 0}
      />
      {/*
       * Header
       */}
      <Box
        h="40px"
        bg="white"
        borderBottomColor="#b0b0b0"
        borderWidth={'0.5px'}
        display="flex"
        flexDir="row"
        justifyContent="space-between"
        py="8px"
        px="16px">
        <Box display="flex" flexDir="row" alignItems="center">
          <Box mr="8px">
            <Avatar size="sm" src={room.imageURL} />
          </Box>
          <Box display="flex" flexDir="row">
            <Text
              mr={'4px'}
              fontWeight="bold"
              fontSize="18px"
              color={darkFontColor}
              noOfLines={1}>
              {room?.name ? room.name : nameOfEmptyNameGroup(room?.members)}
            </Text>
            <Text
              fontWeight="bold"
              fontSize="18px"
              color={darkFontColor}
              noOfLines={1}>
              {`(${room?.members?.length || 0})`}
            </Text>
          </Box>
        </Box>
        <Box display="flex" flexDir="row" alignItems="center">
          <Link mr="4px" onClick={() => setVisibleNoteModal(true)}>
            <FiFileText size={24} />
          </Link>
          <Link mr="4px" onClick={() => setVisibleAlbumModal(true)}>
            <AiOutlinePicture size={24} />
          </Link>
          <Menu
            direction="left"
            onItemClick={(e) => onMenuClicked(e.value as MenuValue)}
            menuButton={
              <MenuButton>
                <HiOutlineDotsCircleHorizontal size={24} />
              </MenuButton>
            }
            transition>
            <MenuItem value={'editGroup'}>ルームの情報を編集</MenuItem>
            <MenuItem value={'editMembers'}>メンバーを編集</MenuItem>
            <MenuItem value={'leaveRoom'}>ルームを退室</MenuItem>
          </Menu>
        </Box>
      </Box>
      {/*
       * Messages
       */}
      <Box
        ref={messageWrapperDivRef}
        h={!newChatMessage.replyParentMessage ? '73%' : '60%'}
        bg="white"
        display="flex"
        flexDir="column-reverse"
        overflowY="auto"
        borderBottom="1px #ececec solid"
        p="8px"
        whiteSpace="pre-wrap"
        onScroll={onScrollTopOnChat}>
        {messages ? (
          <>
            {messages.map((m) => (
              <ChatMessageItem
                usersInRoom={room.members || []}
                key={m.id + m.content}
                message={m}
                readUsers={readUsers(m)}
                onClickReply={() =>
                  setNewChatMessage((pre) => ({
                    ...pre,
                    replyParentMessage: m,
                  }))
                }
                onClickImage={() => {
                  if (m.type === ChatMessageType.IMAGE) {
                    setSelectedImageURL(m.content);
                  }
                }}
              />
            ))}
          </>
        ) : (
          <Box
            h="80%"
            bg="white"
            display="flex"
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            borderBottom="1px #ececec solid"
            px="8px">
            <Text color={darkFontColor} mb="60px">
              このルームは存在しないか権限がありません
            </Text>
          </Box>
        )}
      </Box>
      {newChatMessage.replyParentMessage && (
        <Box
          display="flex"
          flexDir="row"
          alignItems="center"
          h="13%"
          borderBottomWidth={1}
          px="8px"
          position="relative"
          borderBottomColor="gray">
          <Link
            onClick={() =>
              setNewChatMessage((pre) => ({
                ...pre,
                replyParentMessage: undefined,
              }))
            }
            position="absolute"
            bg="transparent"
            rounded="full"
            size="sm"
            top={0}
            right={0}>
            <IoCloseSharp size={24} color={darkFontColor} />
          </Link>
          <UserAvatar
            mr="8px"
            src={newChatMessage.replyParentMessage.sender?.avatarUrl}
            size="md"
            user={newChatMessage.replyParentMessage.sender}
          />
          <Box display="flex" justifyContent="center" flexDir="column" w="100%">
            <Text fontWeight="bold">
              {userNameFactory(newChatMessage.replyParentMessage.sender)}
            </Text>
            <Text isTruncated w="90%" noOfLines={1}>
              {replyTargetContent(newChatMessage.replyParentMessage)}
            </Text>
          </Box>
        </Box>
      )}
      <Box
        boxSizing="border-box"
        cursor="text"
        p="16px"
        bg="#fefefe"
        overflowY="auto"
        h="20%"
        onClick={() => {
          editorRef.current?.focus();
        }}>
        <Editor
          editorKey={'editor'}
          placeholder="メッセージを入力"
          editorState={editorState}
          onChange={onEditorChange}
          plugins={plugins}
          ref={editorRef}
        />
        <MentionSuggestions
          open={popup}
          onOpenChange={onSuggestionOpenChange}
          suggestions={suggestions}
          onSearchChange={onSuggestionSearchChange}
          onAddMention={onAddMention}
        />
      </Box>
      <Link
        color={darkFontColor}
        position="absolute"
        zIndex={1}
        bottom={'8px'}
        cursor="pointer"
        right="50px">
        <input {...getInputProps()} />
        <AiOutlinePaperClip size={20} color={darkFontColor} />
      </Link>

      <Link
        color={darkFontColor}
        position="absolute"
        zIndex={1}
        bottom={'8px'}
        cursor="pointer"
        right="8px">
        <IoSend
          size={20}
          onClick={() => handleSubmit()}
          color={darkFontColor}
        />
      </Link>
    </Box>
  );
};

export default ChatBox;
