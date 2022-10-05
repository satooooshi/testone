import React from 'react';
import { QAAnswerReply } from 'src/types';
import answerReplyStyles from '@/styles/components/AnswerReply.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import WikiComment from '../WikiComment';
import Link from 'next/link';
import boldMascot from '@/public/bold-mascot.png';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type AnswerReplyProps = {
  reply: QAAnswerReply;
};

const AnswerReply: React.FC<AnswerReplyProps> = ({ reply }) => {
  return (
    <Box w="70vw">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex mr="5%" alignItems="center">
          {reply.writer?.existence ? (
            <Link
              key={reply.writer?.id}
              href={`/account/${reply.writer?.id}`}
              passHref>
              <a>
                <Avatar
                  cursor="pointer"
                  h="50px"
                  w="50px"
                  borderRadius="25px"
                  mr="20px"
                  src={reply.writer?.avatarUrl}
                />
              </a>
            </Link>
          ) : (
            <Avatar
              cursor="pointer"
              h="50px"
              w="50px"
              borderRadius="25px"
              mr="20px"
              src={boldMascot.src}
            />
          )}
          <Text color="gray">{userNameFactory(reply.writer)}</Text>
        </Flex>
        <Text>
          {`投稿: ${dateTimeFormatterFromJSDDate({
            dateTime: new Date(reply.createdAt),
            format: 'yyyy/LL/dd ',
          })}`}
        </Text>
      </Flex>
      <WikiComment textFormat={reply.textFormat} body={reply.body} />
    </Box>
  );
};

export default AnswerReply;
