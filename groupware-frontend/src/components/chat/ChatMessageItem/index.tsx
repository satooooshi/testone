import { Box, Image, Link, Text } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { AiOutlineFileProtect } from 'react-icons/ai';
import { Avatar } from '@chakra-ui/react';
import { ChatMessage, ChatMessageType, LastReadChatTime } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import boldMascot from '@/public/bold-mascot.png';
import { darkFontColor } from 'src/utils/colors';

type ChatMessageItemProps = {
  message: ChatMessage;
  lastReadChatTime: LastReadChatTime[];
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  lastReadChatTime,
}) => {
  const messageReadCount = useCallback(
    (message: ChatMessage): number => {
      return lastReadChatTime?.filter((l) => l.readTime >= message.updatedAt)
        .length;
    },
    [lastReadChatTime],
  );

  return (
    <>
      {message.type === ChatMessageType.SYSTEM_TEXT && (
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
          mb={'16px'}
          maxW="50vw">
          <Text fontSize={'14px'}>{message.content}</Text>
        </Box>
      )}
      {message.type !== ChatMessageType.SYSTEM_TEXT && (
        <Box
          display="flex"
          mb="16px"
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
              <Box>
                {messageReadCount(message) ? (
                  <Text mx="8px" color="gray" fontSize="12px">
                    既読
                    {messageReadCount(message)}
                  </Text>
                ) : null}
                <Text mx="8px" color="gray" fontSize="12px">
                  {dateTimeFormatterFromJSDDate({
                    dateTime: new Date(message.createdAt),
                    format: 'HH:mm',
                  })}
                </Text>
              </Box>
            )}
            <Box display="flex" flexDir="column" alignItems="flex-start">
              <Text>
                {message.sender && message.sender?.existence
                  ? userNameFactory(message.sender)
                  : 'ボールドくん'}
              </Text>
              {message.type === ChatMessageType.TEXT ? (
                <Text
                  borderRadius="8px"
                  p="8px"
                  maxW={'40vw'}
                  minW={'10vw'}
                  wordBreak={'break-word'}
                  color={message.isSender ? 'white' : darkFontColor}
                  bg={message.isSender ? 'blue.500' : '#ececec'}>
                  {mentionTransform(message.content)}
                </Text>
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
              <Text mx="8px" color="gray">
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(message.createdAt),
                  format: 'HH:mm',
                })}
              </Text>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default ChatMessageItem;
