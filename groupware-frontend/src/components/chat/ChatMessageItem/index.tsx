import {
  Box,
  Button,
  Link,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Text,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react';
import React, { Fragment, useMemo, useRef } from 'react';
import { Avatar } from '@chakra-ui/react';
import {
  ChatMessage,
  ChatMessageReaction,
  ChatMessageType,
  LastReadChatTime,
  User,
} from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import boldMascot from '@/public/bold-mascot.png';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import { useState } from 'react';
import { useAPISaveReaction } from '@/hooks/api/chat/useAPISaveReaction';
import { reactionEmojis } from 'src/utils/reactionEmojis';
import { ReactionedButton } from './ReactionedButton';
import SystemMessage from './SystemMessage';
import VideoMessage from './VideoMessage';
import ImageMessage from './ImageMessage';
import FileMessage from './FileMessage';
import TextMessage from './TextMessage';
import CallMessage from './CallMessage';
import { useAPIDeleteReaction } from '@/hooks/api/chat/useAPIDeleteReaction';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import ReactionListModal from './ReactionListModal';
import ReadUsersListModal from './ReadUsersListModal';
import { useEffect } from 'react';
import StickerMessage from './StickerMessage';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useAPIDeleteChatMessage } from '@/hooks/api/chat/useAPIDeleteChatMessage';
import { socket } from '../ChatBox/socket';

type ChatMessageItemProps = {
  message: ChatMessage;
  onClickReply: () => void;
  onClickImage: () => void;
  usersInRoom: User[];
  isScrollTarget?: boolean;
  scrollToTarget?: (position: number) => void;
  confirmedSearchWord: string;
  searchedResultIds?: (number | undefined)[];
  lastReadChatTime: LastReadChatTime[] | undefined;
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  usersInRoom,
  message,
  onClickReply,
  onClickImage,
  isScrollTarget = false,
  scrollToTarget,
  confirmedSearchWord,
  searchedResultIds,
  lastReadChatTime,
}) => {
  const { mutate: deleteMessage } = useAPIDeleteChatMessage({
    onSuccess: (data) => {
      socket.emit('message', {
        type: 'delete',
        chatMessage: { ...data, isSender: false },
      });
    },
  });
  const [messageState, setMessageState] = useState(message);
  const [visibleReadModal, setVisibleLastReadModal] = useState(false);
  const [reactionModal, setReactionModal] = useState(false);
  const { user } = useAuthenticate();
  const [editMessage, setEditMessage] = useState(false);
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { mutate: saveReaction } = useAPISaveReaction();
  const { mutate: deleteReaction } = useAPIDeleteReaction();
  const toast = useToast();
  const reactionRemovedDuplicates = (reactions: ChatMessageReaction[]) => {
    let reactionsNoDuplicates: ChatMessageReaction[] = [];
    for (const r of reactions) {
      reactionsNoDuplicates = reactionsNoDuplicates.filter(
        (duplicated) => duplicated.emoji !== r.emoji,
      );
      reactionsNoDuplicates.push(r);
    }
    return reactionsNoDuplicates;
  };
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollToTarget && isScrollTarget && ref.current?.offsetTop) {
      scrollToTarget(ref.current?.offsetTop - 80);
    }
  }, [isScrollTarget, scrollToTarget]);

  useEffect(() => {
    setMessageState(message);
  }, [message]);

  const readUsers = useMemo(() => {
    return lastReadChatTime
      ? lastReadChatTime
          .filter((t) => new Date(t.readTime) >= new Date(message.createdAt))
          .map((t) => t.user)
      : [];
  }, [lastReadChatTime, message]);

  const reactionList = (
    <Box flexDir="row" flexWrap="wrap" display="flex" maxW={'50vw'}>
      {messageState.reactions?.length ? (
        <>
          {reactionRemovedDuplicates(messageState.reactions).map((r) => (
            <Box key={r.id} mb="4px" mr="4px">
              <ReactionedButton
                reaction={r}
                reactions={messageState.reactions || []}
                onClickReaction={(r) =>
                  r.isSender
                    ? handleDeleteReaction(r, messageState)
                    : handleSaveReaction(r.emoji, messageState)
                }
              />
            </Box>
          ))}
          {message.isSender ? (
            <Button
              onClick={() => {
                setReactionModal(true);
              }}
              bg={'blue.200'}
              flexDir="row"
              borderColor={'blue.600'}
              borderWidth={1}
              size="xs">
              <AiOutlineUnorderedList size={24} />
            </Button>
          ) : null}
        </>
      ) : null}
    </Box>
  );

  const createdAtText = (
    <Text mx="8px" color="gray" fontSize={'12px'}>
      {dateTimeFormatterFromJSDDate({
        dateTime: new Date(messageState.createdAt),
        format: 'LL/dd HH:mm',
      })}
    </Text>
  );

  const reactionPopOverRef = useRef(null);
  const reactionOpenerRef = useRef<HTMLButtonElement | null>(null);

  const errorOnUpdatingReaction = () => {
    toast({
      title:
        'リアクションの更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const emitReaction = (message: ChatMessage) => {
    socket.emit('message', {
      type: 'edit',
      chatMessage: { ...message, isSender: false },
    });
  };

  const handleDeleteReaction = (
    reaction: ChatMessageReaction,
    target: ChatMessage,
  ) => {
    deleteReaction(reaction, {
      onSuccess: (reactionId) => {
        setMessageState((m) => {
          if (m.id === target.id) {
            const message = {
              ...m,
              reactions: m.reactions?.filter((r) => r.id !== reactionId),
            };
            emitReaction(message);
          }
          return m;
        });
      },
      onError: () => {
        errorOnUpdatingReaction();
      },
    });
  };

  const handleSaveReaction = async (emoji: string, target?: ChatMessage) => {
    const reaction: Partial<ChatMessageReaction> = {
      emoji,
      chatMessage: target,
    };
    saveReaction(reaction, {
      onSuccess: (savedReaction) => {
        const reactionAdded = { ...savedReaction, isSender: true };
        setMessageState((m) => {
          if (m.id === savedReaction.chatMessage?.id) {
            const message = {
              ...m,
              reactions: m.reactions?.length
                ? [...m.reactions, reactionAdded]
                : [reactionAdded],
            };
            emitReaction(message);
            return message;
          }
          return m;
        });
      },
      onError: () => {
        errorOnUpdatingReaction();
      },
    });
  };

  const isBeforeTwelveHours = (createdAt: Date | undefined) => {
    if (!createdAt) {
      return false;
    }
    const date = new Date();
    date.setHours(date.getHours() - 12);

    return new Date(createdAt) > date;
  };

  const menuOpener = (
    <Popover
      closeOnBlur={false}
      placement="left"
      initialFocusRef={reactionPopOverRef}>
      {({ onClose }) => (
        <>
          <Portal>
            <PopoverContent>
              <PopoverHeader border="0">
                <PopoverCloseButton />
              </PopoverHeader>

              <PopoverBody>
                <SimpleGrid columns={6}>
                  {reactionEmojis.map((e) => (
                    <Fragment key={e}>
                      <Text
                        cursor="pointer"
                        key={e}
                        fontSize={24}
                        onClick={() => {
                          handleSaveReaction(e, messageState);
                          onClose();
                        }}>
                        {e}
                      </Text>
                    </Fragment>
                  ))}
                </SimpleGrid>
              </PopoverBody>
            </PopoverContent>
          </Portal>
          <Menu
            direction="left"
            menuButton={
              <div style={{ cursor: 'pointer' }}>
                <PopoverTrigger>
                  <Button
                    h={0}
                    w={0}
                    minW={0}
                    maxW={0}
                    ref={reactionOpenerRef}
                  />
                </PopoverTrigger>
                <HiOutlineDotsCircleHorizontal size={24} color={'#b0b0b0'} />
              </div>
            }
            transition>
            <MenuItem value={'reply'} onClick={onClickReply}>
              返信
            </MenuItem>
            <MenuItem
              value={'reaction'}
              onClick={() => reactionOpenerRef.current?.click()}>
              リアクション
            </MenuItem>
            {messageState?.sender?.id === user?.id &&
            messageState.type === ChatMessageType.TEXT &&
            isBeforeTwelveHours(messageState.createdAt) ? (
              <MenuItem value={'edit'} onClick={() => setEditMessage(true)}>
                メッセージを編集
              </MenuItem>
            ) : null}
            {messageState?.sender?.id === user?.id &&
            isBeforeTwelveHours(messageState.createdAt) ? (
              <MenuItem
                value={'delete'}
                onClick={() => {
                  if (confirm('メッセージを削除してよろしいですか？')) {
                    deleteMessage(messageState);
                  }
                }}>
                <Text color="red">メッセージを削除</Text>
              </MenuItem>
            ) : null}
          </Menu>
        </>
      )}
    </Popover>
  );

  if (!message.content) {
    return <></>;
  }

  return (
    <Box
      ref={ref}
      display="flex"
      flexDir="column"
      alignItems={messageState.isSender ? 'flex-end' : 'flex-start'}>
      <ReadUsersListModal
        usersInRoom={usersInRoom}
        isOpen={visibleReadModal}
        onClose={() => setVisibleLastReadModal(false)}
        readUsers={readUsers}
      />

      <ReactionListModal
        isOpen={reactionModal}
        onClose={() => setReactionModal(false)}
        reactions={messageState.reactions || []}
      />
      {messageState.type === ChatMessageType.SYSTEM_TEXT ? (
        <SystemMessage message={messageState} />
      ) : null}
      {messageState.type !== ChatMessageType.SYSTEM_TEXT && (
        <Box
          display="flex"
          mb="4px"
          maxW="50vw"
          key={messageState.id}
          alignSelf={messageState.isSender ? 'flex-end' : 'flex-start'}
          flexDir={messageState.isSender ? 'row-reverse' : undefined}>
          {!messageState.isSender ? (
            <Link href={`/account/${messageState.sender?.id}`} passHref>
              <Avatar
                h="40px"
                w="40px"
                cursor="pointer"
                src={
                  !messageState.sender?.existence
                    ? boldMascot.src
                    : messageState.sender?.avatarUrl
                }
              />
            </Link>
          ) : null}
          <Box display="flex" alignItems="flex-end">
            {messageState.isSender && (
              <>
                {menuOpener}
                <Box>
                  {readUsers.length ? (
                    <Link
                      onClick={() => setVisibleLastReadModal(true)}
                      mx="4px"
                      color="gray"
                      fontSize="12px">
                      既読
                      {readUsers.length}
                    </Link>
                  ) : null}
                  {createdAtText}
                </Box>
              </>
            )}
            <Box display="flex" flexDir="column" alignItems="flex-start">
              {!messageState.isSender && (
                <Text>
                  {messageState.sender && messageState.sender?.existence
                    ? userNameFactory(messageState.sender)
                    : 'ボールドくん'}
                </Text>
              )}
              {messageState.type === ChatMessageType.TEXT ? (
                <TextMessage
                  message={messageState}
                  confirmedSearchWord={confirmedSearchWord}
                  searchedResultIds={searchedResultIds}
                  editMessage={editMessage}
                  finishEdit={() => setEditMessage(false)}
                />
              ) : messageState.type === ChatMessageType.CALL ? (
                <CallMessage message={messageState} />
              ) : (
                <Box
                  borderRadius="8px"
                  p="8px"
                  maxW={isSmallerThan768 ? undefined : '40vw'}
                  minW={'150px'}
                  wordBreak="break-word">
                  {messageState.type === ChatMessageType.IMAGE ? (
                    <ImageMessage
                      message={messageState}
                      onClick={onClickImage}
                    />
                  ) : messageState.type === ChatMessageType.VIDEO ? (
                    <VideoMessage message={messageState} />
                  ) : messageState.type === ChatMessageType.STICKER ? (
                    <StickerMessage message={messageState} />
                  ) : (
                    <FileMessage message={messageState} />
                  )}
                </Box>
              )}
            </Box>
            {!messageState.isSender && (
              <>
                {createdAtText}
                {menuOpener}
              </>
            )}
          </Box>
        </Box>
      )}
      {reactionList}
    </Box>
  );
};

export default ChatMessageItem;
