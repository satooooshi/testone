import { Avatar, Box, useMediaQuery, Text, Link } from '@chakra-ui/react';
import { MentionData } from '@draft-js-plugins/mention';
import { darkFontColor } from 'src/utils/colors';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import Editor from '@draft-js-plugins/editor';
import { EditorState } from 'draft-js';
import { AiOutlinePaperClip, AiOutlinePicture } from 'react-icons/ai';
import {
  ChatGroup,
  ChatMessage,
  ChatMessageReaction,
  LastReadChatTime,
  User,
} from 'src/types';
import { MenuValue } from '@/hooks/chat/useModalReducer';
import React, { useMemo, useRef } from 'react';
import ChatMessageItem from '../ChatMessageItem';
import chatStyles from '@/styles/layouts/Chat.module.scss';
import { IoCloseSharp, IoSend } from 'react-icons/io5';
import { FiFileText } from 'react-icons/fi';
import createMentionPlugin from '@draft-js-plugins/mention';
import { useDropzone } from 'react-dropzone';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type ChatBoxProps = {
  room: ChatGroup;
  onMenuClicked: (menuValue: MenuValue) => void;
  onScrollTopOnChat: (scrollEvent: any) => void;
  messages: ChatMessage[];
  onSend: () => void;
  replyParentMessage?: ChatMessage;
  onClickNoteIcon: () => void;
  onClickAlbumIcon: () => void;
  onClickReaction: (chatMessage: ChatMessage) => void;
  onClickSpecificReaction: (reaction: ChatMessageReaction) => void;
  onClickReply: (chatMessage: ChatMessage) => void;
  onCloseReply: () => void;
  deletedReactionIds: number[];
  suggestions: MentionData[];
  lastReadChatTime: LastReadChatTime[];
  editorState: EditorState;
  onEditorChange: (editorState: EditorState) => void;
  onUploadFile: (file: File[]) => void;
  popupOpened: boolean;
  onSuggestionOpenChange(open: boolean): void;
  editorSuggestions: MentionData[];
  onSuggestionSearchChange(event: { trigger: string; value: string }): void;
  onAddMention: (Mention: MentionData) => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({
  room,
  onMenuClicked,
  onScrollTopOnChat,
  messages,
  onSend,
  lastReadChatTime,
  editorState,
  replyParentMessage,
  onClickAlbumIcon,
  onClickNoteIcon,
  onClickReaction,
  onClickSpecificReaction,
  onCloseReply,
  onClickReply,
  deletedReactionIds,
  onEditorChange,
  onUploadFile,
  popupOpened,
  onSuggestionOpenChange,
  editorSuggestions,
  onSuggestionSearchChange,
  onAddMention,
}) => {
  const messageWrapperDivRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor>(null);
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { getRootProps: getRootProps, getInputProps: getInputProps } =
    useDropzone({
      noDrag: true,
      onDrop: (f) => onUploadFile(f),
    });

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

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

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
        h="7%"
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
          <Text fontWeight="bold" fontSize="18px" color={darkFontColor}>
            {room?.name ? room.name : nameOfEmptyNameGroup(room?.members)}
          </Text>
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
        h={!replyParentMessage ? '73%' : '60%'}
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
                onClickSpecificReaction={onClickSpecificReaction}
                onClickReaction={() => onClickReaction(m)}
                onClickReply={() => onClickReply(m)}
                key={m.id}
                message={m}
                lastReadChatTime={lastReadChatTime}
                deletedReactionIds={deletedReactionIds}
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
      {replyParentMessage && (
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
            onClick={onCloseReply}
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
            src={replyParentMessage.sender?.avatarUrl}
            size="md"
          />
          <Box display="flex" justifyContent="center" flexDir="column">
            <Text fontWeight="bold">
              {userNameFactory(replyParentMessage.sender)}
            </Text>
            <Text noOfLines={1}>{replyParentMessage.content}</Text>
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
          open={popupOpened}
          onOpenChange={onSuggestionOpenChange}
          suggestions={editorSuggestions}
          onSearchChange={onSuggestionSearchChange}
          onAddMention={onAddMention}
        />
      </Box>
      <Box {...getRootProps()}>
        <input {...getInputProps()} />
        <AiOutlinePaperClip size={20} className={chatStyles.clip_icon} />
      </Box>

      <IoSend size={20} onClick={onSend} className={chatStyles.send_icon} />
    </Box>
  );
};

export default ChatBox;
