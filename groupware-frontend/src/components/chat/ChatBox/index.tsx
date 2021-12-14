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

type ChatBoxProps = {
  room: ChatGroup;
  onMenuClicked: (menuValue: MenuValue) => void;
  onClickNoteIcon: () => void;
  onClickAlbumIcon: () => void;
  onClickReaction: (message: ChatMessage) => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({
  room,
  onMenuClicked,
  onClickAlbumIcon,
  onClickNoteIcon,
  onClickReaction,
}) => {
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
  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime();
  const { data: lastReadChatTime } = useAPIGetLastReadChatTime(room.id, {
    refetchInterval: 1000,
  });
  const [{ popup, suggestions, mentionedUserData }, dispatchMention] =
    useMention();
  const { data: fetchedPastMessages } = useAPIGetMessages({
    group: room.id,
    page: page.toString(),
  });
  const { data: latestMessage, isLoading: isLoadingLatestMsg } =
    useAPIGetMessages(
      {
        group: room.id,
        page: '1',
      },
      { refetchInterval: 1000 },
    );

  const { mutate: sendChatMessage } = useAPISendChatMessage({
    onSuccess: (data) => {
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
  const { getRootProps: getRootProps, getInputProps: getInputProps } =
    useDropzone({
      noDrag: true,
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
  }, [dispatchMention, room?.members]);

  useEffect(() => {
    setMessages([]);
    setPage(1);
  }, [room]);

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

  return (
    <Box
      w={isSmallerThan768 ? '100%' : '60vw'}
      h="100%"
      bg="white"
      position="relative"
      borderRadius="md"
      boxShadow="md">
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
          <Link mr="4px" onClick={onClickNoteIcon}>
            <FiFileText size={24} />
          </Link>
          <Link mr="4px" onClick={onClickAlbumIcon}>
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
            <MenuItem value={'editGroup'}>グループの情報を編集</MenuItem>
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
        overflow="scroll"
        borderBottom="1px #ececec solid"
        px="8px"
        whiteSpace="pre-wrap"
        onScroll={onScrollTopOnChat}>
        {messages ? (
          <>
            {messages.map((m) => (
              <ChatMessageItem
                key={m.id}
                message={m}
                readUsers={readUsers(m)}
                onClickReply={() =>
                  setNewChatMessage((pre) => ({
                    ...pre,
                    replyParentMessage: m,
                  }))
                }
                onClickReaction={() => onClickReaction(m)}
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
          <Avatar
            mr="8px"
            src={newChatMessage.replyParentMessage.sender?.avatarUrl}
            size="md"
          />
          <Box display="flex" justifyContent="center" flexDir="column">
            <Text fontWeight="bold">
              {userNameFactory(newChatMessage.replyParentMessage.sender)}
            </Text>
            <Text noOfLines={1}>
              {mentionTransform(newChatMessage.replyParentMessage.content)}
            </Text>
          </Box>
        </Box>
      )}
      <Box
        boxSizing="border-box"
        cursor="text"
        p="16px"
        bg="#fefefe"
        overflow="scroll"
        w={isSmallerThan768 ? '85%' : '92%'}
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
        {...getRootProps()}
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
