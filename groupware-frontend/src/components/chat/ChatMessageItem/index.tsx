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
import React, { Fragment, useRef } from 'react';
import { Avatar } from '@chakra-ui/react';
import {
  ChatMessage,
  ChatMessageReaction,
  ChatMessageType,
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
import { useAPIDeleteReaction } from '@/hooks/api/chat/useAPIDeleteReaction';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import ReactionListModal from './ReactionListModal';
import ReadUsersListModal from './ReadUsersListModal';
import { useEffect } from 'react';

type ChatMessageItemProps = {
  message: ChatMessage;
  onClickReply: () => void;
  readUsers: User[];
  onClickImage: () => void;
  usersInRoom: User[];
  isScrollTarget?: boolean;
  scrollToTarget?: (position: number) => void;
  confirmedSearchWord: string;
  searchedResultIds?: (number | undefined)[];
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  usersInRoom,
  message,
  onClickReply,
  readUsers,
  onClickImage,
  isScrollTarget = false,
  scrollToTarget,
  confirmedSearchWord,
  searchedResultIds,
}) => {
  const [messageState, setMessageState] = useState(message);
  const [visibleReadModal, setVisibleLastReadModal] = useState(false);
  const [reactionModal, setReactionModal] = useState(false);
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

  const handleDeleteReaction = (
    reaction: ChatMessageReaction,
    target: ChatMessage,
  ) => {
    deleteReaction(reaction, {
      onSuccess: (reactionId) => {
        setMessageState((m) => {
          if (m.id === target.id) {
            return {
              ...m,
              reactions: m.reactions?.filter((r) => r.id !== reactionId),
            };
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
            return {
              ...m,
              reactions: m.reactions?.length
                ? [...m.reactions, reactionAdded]
                : [reactionAdded],
            };
          }
          return m;
        });
      },
      onError: () => {
        errorOnUpdatingReaction();
      },
    });
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
              <MenuButton>
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
              </MenuButton>
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
        sender={messageState.sender}
        onClose={() => setVisibleLastReadModal(false)}
        readUsers={readUsers.filter((u) => u.id !== messageState?.sender?.id)}
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
                      mx="8px"
                      mb="4px"
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
                />
              ) : (
                <Box
                  borderRadius="8px"
                  p="8px"
                  maxW={isSmallerThan768 ? undefined : '40vw'}
                  minW={'300px'}
                  wordBreak="break-word">
                  {messageState.type === ChatMessageType.IMAGE ? (
                    <ImageMessage
                      message={messageState}
                      onClick={onClickImage}
                    />
                  ) : messageState.type === ChatMessageType.VIDEO ? (
                    <VideoMessage message={messageState} />
                  ) : (
                    <FileMessage message={messageState} />
                  )}
                </Box>
              )}
            </Box>
            {!messageState.isSender && (
              <>
                <Box display="flex" flexDir="column">
                  {readUsers.length ? (
                    <Link
                      onClick={() => setVisibleLastReadModal(true)}
                      mx="8px"
                      mb="4px"
                      color="gray"
                      fontSize="12px">
                      既読
                      {readUsers.length}
                    </Link>
                  ) : null}
                  {createdAtText}
                </Box>
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
