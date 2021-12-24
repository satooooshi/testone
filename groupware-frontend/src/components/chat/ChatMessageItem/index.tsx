import {
  Box,
  Button,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
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
import React, { useRef } from 'react';
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
import { darkFontColor } from 'src/utils/colors';
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

type ChatMessageItemProps = {
  message: ChatMessage;
  onClickReply: () => void;
  readUsers: User[];
  onClickImage: () => void;
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onClickReply,
  readUsers,
  onClickImage,
}) => {
  const [messageState, setMessageState] = useState(message);
  const [visibleReadModal, setVisibleLastReadModal] = useState(false);
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

  const reactionList = (
    <Box flexDir="row" flexWrap="wrap" display="flex" maxW={'50vw'}>
      {messageState.reactions?.length
        ? reactionRemovedDuplicates(messageState.reactions).map((r) => (
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
          ))
        : null}
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
                    <>
                      <Text
                        cursor="pointer"
                        key={e}
                        fontSize={24}
                        onClick={() => {
                          saveReaction(
                            { emoji: e, chatMessage: messageState },
                            {
                              onSuccess: (savedReaction) => {
                                const reactionAdded = {
                                  ...savedReaction,
                                  isSender: true,
                                };
                                setMessageState((m) => ({
                                  ...m,
                                  reactions: m.reactions?.length
                                    ? [...m.reactions, reactionAdded]
                                    : [reactionAdded],
                                }));
                                onClose();
                              },
                              onError: () => {
                                alert(
                                  'リアクションの更新中にエラーが発生しました。\n時間をおいて再実行してください。',
                                );
                              },
                            },
                          );
                        }}>
                        {e}
                      </Text>
                    </>
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
                <HiOutlineDotsCircleHorizontal size={24} />
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

  return (
    <Box
      display="flex"
      flexDir="column"
      alignItems={messageState.isSender ? 'flex-end' : 'flex-start'}>
      <Modal
        isOpen={visibleReadModal}
        onClose={() => setVisibleLastReadModal(false)}>
        <ModalOverlay />
        <ModalContent h="90vh" bg={'#f9fafb'}>
          <ModalHeader>既読一覧</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {readUsers.map((u) => (
              <Link
                key={u.id}
                display="flex"
                flexDir="row"
                borderBottom={'1px'}
                py="8px"
                alignItems="center"
                justifyContent="space-between"
                href={`/account/${u?.id}`}
                passHref>
                <Box display="flex" flexDir="row" alignItems="center">
                  <Avatar src={u.avatarUrl} w="40px" h="40px" mr="16px" />
                  <Text fontSize={darkFontColor}>{userNameFactory(u)}</Text>
                </Box>
              </Link>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
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
                <TextMessage message={messageState} />
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
