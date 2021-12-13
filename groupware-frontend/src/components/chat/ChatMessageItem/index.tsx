import {
  Box,
  Button,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { AiOutlineFileProtect } from 'react-icons/ai';
import { Avatar } from '@chakra-ui/react';
import {
  ChatMessage,
  ChatMessageReaction,
  ChatMessageType,
  User,
} from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import boldMascot from '@/public/bold-mascot.png';
import { darkFontColor } from 'src/utils/colors';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import { numbersOfSameValueInKeyOfObjArr } from 'src/utils/numbersOfSameValueInKeyOfObjArr';
import { useState } from 'react';
import { useAPISaveReaction } from '@/hooks/api/chat/useAPISaveReaction';
import { useAPIDeleteReaction } from '@/hooks/api/chat/useAPIDeleteReaction';
import { useAuthenticate } from 'src/contexts/useAuthenticate';

type ChatMessageItemProps = {
  message: ChatMessage;
  onClickReaction: () => void;
  onClickReply: () => void;
  readUsers: User[];
};

const ReactionButton = ({
  reactions,
  reaction,
}: {
  reactions: ChatMessageReaction[];
  reaction: ChatMessageReaction;
}) => {
  const { user } = useAuthenticate();
  const [count, setCount] = useState(
    numbersOfSameValueInKeyOfObjArr(
      reactions as ChatMessageReaction[],
      reaction,
      'emoji',
    ),
  );
  const [isSender, setIsSender] = useState(reaction.isSender || false);
  const { mutate: saveReaction } = useAPISaveReaction();
  const { mutate: deleteReaction } = useAPIDeleteReaction();

  return (
    <Button
      onClick={() => {
        if (user) {
          if (isSender) {
            deleteReaction(
              { ...reaction, user },
              {
                onSuccess: () => {
                  setIsSender(!isSender);
                  setCount((c) => c - 1);
                },
              },
            );
          } else {
            saveReaction(
              { ...reaction, user },
              {
                onSuccess: () => {
                  setIsSender(!isSender);
                  setCount((c) => c + 1);
                },
              },
            );
          }
        }
      }}
      bg={isSender ? 'blue.600' : undefined}
      flexDir="row"
      borderColor={'blue.600'}
      borderWidth={1}
      size="sm">
      <Text fontSize={16}>{reaction.emoji}</Text>
      <Text fontSize={16} color={reaction.isSender ? 'white' : undefined}>
        {count}
      </Text>
    </Button>
  );
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onClickReaction,
  onClickReply,
  readUsers,
}) => {
  const [visibleReadModal, setVisibleLastReadModal] = useState(false);
  const reactionRemovedDuplicates = (reactions: ChatMessageReaction[]) => {
    const reactionsNoDuplicates: ChatMessageReaction[] = [];
    for (const r of reactions) {
      if (
        reactionsNoDuplicates.filter(
          (duplicated) => duplicated.isSender || duplicated.emoji !== r.emoji,
        )
      ) {
        reactionsNoDuplicates.push(r);
      }
    }
    return reactionsNoDuplicates;
  };

  const reactionList = (
    <Box flexDir="row" flexWrap="wrap" display="flex" maxW={'50vw'}>
      {message.reactions?.length
        ? reactionRemovedDuplicates(message.reactions).map((r) => (
            <Box key={r.id} mb="4px" mr="4px">
              <ReactionButton
                reaction={r}
                reactions={message.reactions || []}
              />
            </Box>
          ))
        : null}
    </Box>
  );

  const sysmtemText = (
    <Box
      bg="#ececec"
      borderRadius="md"
      alignSelf="center"
      display="flex"
      flexDir="row"
      justifyContent="center"
      alignItems="center"
      minW="60%"
      minH={'24px'}
      mb={'8px'}
      maxW="50vw">
      <Text fontSize={'14px'}>{message.content}</Text>
    </Box>
  );

  const createdAtText = (
    <Text mx="8px" color="gray" fontSize={'12px'}>
      {dateTimeFormatterFromJSDDate({
        dateTime: new Date(message.createdAt),
        format: 'LL/dd HH:mm',
      })}
    </Text>
  );

  const menuOpener = (
    <Menu
      direction="left"
      menuButton={
        <MenuButton>
          <HiOutlineDotsCircleHorizontal size={24} />
        </MenuButton>
      }
      transition>
      <MenuItem value={'reply'} onClick={onClickReply}>
        返信
      </MenuItem>
      <MenuItem value={'reaction'} onClick={onClickReaction}>
        リアクション
      </MenuItem>
    </Menu>
  );
  const replyContent = (parentMsg: ChatMessage) => {
    switch (parentMsg.type) {
      case ChatMessageType.TEXT:
        return mentionTransform(parentMsg.content);
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
      display="flex"
      flexDir="column"
      alignItems={message.isSender ? 'flex-end' : 'flex-start'}>
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
      {message.type === ChatMessageType.SYSTEM_TEXT && sysmtemText}
      {message.type !== ChatMessageType.SYSTEM_TEXT && (
        <Box
          display="flex"
          mb="4px"
          maxW="50vw"
          key={message.id}
          alignSelf={message.isSender ? 'flex-end' : 'flex-start'}
          flexDir={message.isSender ? 'row-reverse' : undefined}>
          {!message.isSender ? (
            <Link href={`/account/${message.sender?.id}`} passHref>
              <Avatar
                h="40px"
                w="40px"
                cursor="pointer"
                src={
                  !message.sender?.existence
                    ? boldMascot.src
                    : message.sender?.avatarUrl
                }
              />
            </Link>
          ) : null}
          <Box display="flex" alignItems="flex-end">
            {message.isSender && (
              <>
                {menuOpener}
                <Box>
                  {readUsers.length ? (
                    <Link
                      onClick={() => setVisibleLastReadModal(true)}
                      mx="8px"
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
              {!message.isSender && (
                <Text>
                  {message.sender && message.sender?.existence
                    ? userNameFactory(message.sender)
                    : 'ボールドくん'}
                </Text>
              )}
              {message.type === ChatMessageType.TEXT ? (
                <Box
                  maxW={'40vw'}
                  minW={'10vw'}
                  bg={message.isSender ? 'blue.500' : '#ececec'}
                  p="8px"
                  rounded="md">
                  {message.replyParentMessage && (
                    <Box
                      flexDir="row"
                      display="flex"
                      borderBottomWidth={1}
                      borderBottomColor={'white'}
                      pb="4px"
                      color={'black'}>
                      <Avatar
                        h="32px"
                        w="32px"
                        mr="4px"
                        cursor="pointer"
                        src={
                          !message.replyParentMessage.sender?.existence
                            ? boldMascot.src
                            : message.replyParentMessage?.sender.avatarUrl
                        }
                      />
                      <Box>
                        <Text fontWeight="bold">
                          {userNameFactory(message.replyParentMessage?.sender)}
                        </Text>
                        <Text>{replyContent(message.replyParentMessage)}</Text>
                      </Box>
                    </Box>
                  )}
                  <Text
                    borderRadius="8px"
                    maxW={'40vw'}
                    minW={'10vw'}
                    wordBreak={'break-word'}
                    color={message.isSender ? 'white' : darkFontColor}
                    bg={message.isSender ? 'blue.500' : '#ececec'}>
                    {mentionTransform(message.content)}
                  </Text>
                </Box>
              ) : (
                <Box
                  borderRadius="8px"
                  p="8px"
                  maxW="40vw"
                  minW="10vw"
                  wordBreak="break-word">
                  {message.type === ChatMessageType.IMAGE ? (
                    <Box display="flex" maxW="300px" maxH={'300px'}>
                      <Image
                        src={message.content}
                        w={300}
                        h={300}
                        alt="送信された画像"
                      />
                    </Box>
                  ) : message.type === ChatMessageType.VIDEO ? (
                    <Box display="flex" maxW="300px" maxH={'300px'}>
                      <video
                        src={message.content}
                        controls
                        width={300}
                        height={300}
                      />
                    </Box>
                  ) : (
                    <Link
                      href={message.content}
                      mr="8px"
                      display="flex"
                      flexDir="column"
                      alignItems="center"
                      borderWidth={'1px'}
                      borderColor="gray"
                      borderRadius="8px"
                      p="8px">
                      <AiOutlineFileProtect
                        height="48px"
                        width="48px"
                        color={darkFontColor}
                      />
                      <p>
                        {
                          (message.content.match('.+/(.+?)([?#;].*)?$') || [
                            '',
                            message.content,
                          ])[1]
                        }
                      </p>
                    </Link>
                  )}
                </Box>
              )}
            </Box>
            {!message.isSender && (
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
