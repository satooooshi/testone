import UserAvatar from '@/components/common/UserAvatar';
import { Box, Text, Textarea, useMediaQuery, Image } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useState } from 'react';
import { ChatMessage, ChatMessageType } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import { replaceFullWidthSpace } from 'src/utils/replaceWidthSpace';
import Linkify from 'react-linkify';
import { componentDecorator } from 'src/utils/componentDecorator';
import { useAPIUpdateChatMessage } from '@/hooks/api/chat/useAPIUpdateChatMessage';
import { socket } from '../../ChatBox/socket';
import { reactionStickers } from '../../../../utils/reactionStickers';
import NextImage from 'next/image';
import noImage from '@/public/no-image.jpg';

type TextMessageProps = {
  message: ChatMessage;
  confirmedSearchWord: string;
  searchedResultIds?: (number | undefined)[];
  editMessage: boolean;
  finishEdit: () => void;
};

const TextMessage: React.FC<TextMessageProps> = ({
  message,
  confirmedSearchWord,
  searchedResultIds,
  editMessage,
  finishEdit,
}) => {
  const [isEdited, setIsEdited] = useState(false);
  const { mutate: updateMessage } = useAPIUpdateChatMessage({
    onSuccess: (data) => {
      socket.emit('message', {
        type: 'edit',
        chatMessage: { ...data, isSender: false },
      });
      finishEdit();
    },
  });
  const [messageValue, setMessageValue] = useState(message.content);
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const replyContent = (parentMsg: ChatMessage) => {
    switch (parentMsg.type) {
      case ChatMessageType.TEXT:
        return mentionTransform(parentMsg.content);
      case ChatMessageType.IMAGE:
        return '写真';
      case ChatMessageType.VIDEO:
        return '動画';
      case ChatMessageType.STICKER:
        return 'スタンプ';
      case ChatMessageType.OTHER_FILE:
        return 'ファイル';
    }
  };

  const highlightSearchedWord = (message: ChatMessage): ReactNode => {
    const text = mentionTransform(message.content);
    if (confirmedSearchWord) {
      const Exp = new RegExp(
        `(${replaceFullWidthSpace(confirmedSearchWord).replace(' ', '|')})`,
      );
      return text.split(Exp).map((t) => {
        if (t.match(Exp) && searchedResultIds?.includes(message.id)) {
          return <Text as="mark">{t}</Text>;
        }
        return t;
      });
    }
    return text;
  };

  useEffect(() => {
    const escFunction = (e: any) => {
      if (e.key == 'Escape') {
        setMessageValue(message.content);
        finishEdit();
      }
    };
    document.addEventListener('keydown', escFunction);

    return () => {
      document.removeEventListener('keydown', escFunction);
    };
  }, [finishEdit]);

  useEffect(() => {
    if (new Date(message.updatedAt) > new Date(message.createdAt)) {
      setIsEdited(true);
    }
  }, [message.createdAt, message.updatedAt]);

  return (
    <Box
      maxW={isSmallerThan768 ? '300px' : '40vw'}
      minW={isSmallerThan768 ? '140px' : '10vw'}
      bg={message.isSender ? 'blue.500' : '#ececec'}
      p="8px"
      rounded="md">
      <Linkify componentDecorator={componentDecorator}>
        {message.replyParentMessage && (
          <Box
            flexDir="row"
            display="flex"
            borderBottomWidth={1}
            borderBottomColor={'white'}
            pb="4px"
            color={'black'}>
            <UserAvatar
              h="32px"
              w="32px"
              mr="4px"
              cursor="pointer"
              user={message.replyParentMessage.sender}
            />
            <Box width={'50%'}>
              <Text fontWeight="bold">
                {userNameFactory(message.replyParentMessage?.sender)}
              </Text>
              <Text>{replyContent(message.replyParentMessage)}</Text>
            </Box>
            <Box>
              {message.replyParentMessage.type === ChatMessageType.IMAGE ? (
                message?.replyParentMessage?.content ? (
                  <Image
                    loading="lazy"
                    src={message.replyParentMessage.content}
                    w={'100'}
                    h={'100'}
                    objectFit={'contain'}
                    alt="表示できない画像"
                  />
                ) : (
                  <NextImage
                    width="70"
                    height="70"
                    src={noImage}
                    alt="表示できない画像"
                  />
                )
              ) : message.replyParentMessage.type === ChatMessageType.VIDEO ? (
                message?.replyParentMessage?.content ? (
                  <video width="100" height="100" controls={false} muted>
                    <source
                      src={message.replyParentMessage.content}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <NextImage
                    width="70"
                    height="70"
                    src={noImage}
                    alt="表示できない動画"
                  />
                )
              ) : message.replyParentMessage.type ===
                ChatMessageType.STICKER ? (
                message?.replyParentMessage?.content ? (
                  <Image
                    loading="lazy"
                    src={
                      reactionStickers.find(
                        (s) => s.name === message?.replyParentMessage?.content,
                      )?.src
                    }
                    w={'100%'}
                    h={'100'}
                    objectFit={'contain'}
                    alt="表示できない画像"
                  />
                ) : (
                  <NextImage
                    width="70"
                    height="70"
                    src={noImage}
                    alt="表示できない画像"
                  />
                )
              ) : null}
            </Box>
          </Box>
        )}
        {!editMessage ? (
          <>
            <Text
              borderRadius="8px"
              maxW={'40vw'}
              minW={'10vw'}
              wordBreak={'break-word'}
              color={message.isSender ? 'white' : 'black'}>
              {highlightSearchedWord(message)}
            </Text>
            <Text fontSize={3} mt={2} color={darkFontColor} textAlign="right">
              {message.modifiedAt ? ' 編集済み' : null}
            </Text>
          </>
        ) : (
          <>
            <Textarea
              borderRadius="8px"
              maxW={'40vw'}
              minW={'10vw'}
              value={messageValue}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.ctrlKey !== e.metaKey && e.key === 'Enter') {
                  updateMessage({ ...message, content: messageValue });
                }
              }}
              onChange={(e) => setMessageValue(e.target.value)}
              wordBreak={'break-word'}
              color="white"
              bg="blue.500"
            />
            <Text fontSize={12} mt={3}>
              Escキーでキャンセル • Ctr + Enterキーで 保存
            </Text>
          </>
        )}
      </Linkify>
    </Box>
  );
};

export default TextMessage;
