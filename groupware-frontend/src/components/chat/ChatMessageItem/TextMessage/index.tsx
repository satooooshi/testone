import UserAvatar from '@/components/common/UserAvatar';
import {
  Box,
  Button,
  Image,
  Link,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ChatMessage, ChatMessageType } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import { replaceFullWidthSpace } from 'src/utils/replaceWidthSpace';
import Linkify from 'react-linkify';
import { componentDecorator } from 'src/utils/componentDecorator';
import VideoImageThumbnail from 'react-video-thumbnail-image';

type TextMessageProps = {
  message: ChatMessage;
  confirmedSearchWord: string;
  searchedResultIds?: (number | undefined)[];
};

const TextMessage: React.FC<TextMessageProps> = ({
  message,
  confirmedSearchWord,
  searchedResultIds,
}) => {
  const [pressed, setPressed] = useState(false);
  const [closeButton, setCloseButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const NUM_OF_LINES = 3;

  useEffect(() => {
    if (textRef.current) {
      const divHeight = textRef.current.offsetHeight;
      const lineHeight = Number(
        textRef.current.style.lineHeight.replace('px', ''),
      );
      const lines = divHeight / lineHeight;
      if (lines > 3) {
        setCloseButton(true);
      }

      console.log(lines);
      console.log(divHeight, lineHeight);
    }
  }, [pressed]);

  const FoldedTextMessage = (msg: string) => {
    return (
      <Box display="flex" flexDir="column">
        <Link onClick={() => setPressed(true)}>
          <Text
            style={{ lineHeight: '20px' }}
            ref={textRef}
            noOfLines={pressed ? undefined : NUM_OF_LINES}>
            {msg}
          </Text>
        </Link>
        {closeButton && (
          <Button
            fontSize="13px"
            minW={0}
            w="60px"
            h="25px"
            borderRadius={20}
            ml="auto"
            mr="0px"
            bg=""
            onClick={() => {
              setPressed(false);
              setCloseButton(false);
            }}>
            閉じる
          </Button>
        )}
      </Box>
    );
  };
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const replyContent = (parentMsg: ChatMessage) => {
    switch (parentMsg.type) {
      case ChatMessageType.TEXT:
        const msg = mentionTransform(parentMsg.content);
        return FoldedTextMessage(msg);
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
  const reply = message.replyParentMessage;
  return (
    <Box
      maxW={isSmallerThan768 ? '300px' : '40vw'}
      minW={isSmallerThan768 ? '140px' : '10vw'}
      bg={message.isSender ? 'blue.500' : '#ececec'}
      p="8px"
      rounded="md">
      <Linkify componentDecorator={componentDecorator}>
        {reply && (
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
              user={reply.sender}
            />
            <Box width={'90%'}>
              <Text fontWeight="bold">{userNameFactory(reply?.sender)}</Text>
              {replyContent(reply)}
            </Box>
            <Box width={'50%'}>
              {reply.type === ChatMessageType.IMAGE ? (
                <Image
                  boxSize={10}
                  src={
                    reply.content
                      ? reply.content
                      : require('@/public/no-image.jpg')
                  }
                />
              ) : reply.type == ChatMessageType.VIDEO ? (
                reply.content ? (
                  <Box width={50}>
                    <VideoImageThumbnail
                      videoUrl={reply.content}
                      alt="my test video"
                    />
                  </Box>
                ) : (
                  <Image boxSize={10} src={require('@/public/no-image.jpg')} />
                )
              ) : reply.type == ChatMessageType.STICKER ? (
                <Image boxSize={10} src={require('@/public/no-image.jpg')} />
              ) : null}
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
          {highlightSearchedWord(message)}
        </Text>
      </Linkify>
    </Box>
  );
};

export default TextMessage;
