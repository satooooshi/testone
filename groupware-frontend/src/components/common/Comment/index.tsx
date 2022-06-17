import { User } from 'src/types';
import eventCommentStyles from '@/styles/components/EventComment.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import Link from 'next/link';
import boldMascot from '@/public/bold-mascot.png';
import { Avatar, Box, Divider, Heading, Text } from '@chakra-ui/react';

type CommentCardProps = {
  body: string;
  date: Date;
  writer: User;
};
const CommentCard: React.FC<CommentCardProps> = ({ body, date, writer }) => {
  return (
    <Box p={3}>
      <Box
        display="flex"
        flexDir="row"
        alignItem="center"
        justifyContent="space-between">
        <Box display="flex" flexDir="row" alignItem="center">
          {writer.existence ? (
            <Link href={`/account/${writer?.id}`} passHref>
              <a className={eventCommentStyles.comment_name_wrapper}>
                <Avatar
                  className={eventCommentStyles.user_avatar}
                  src={writer.avatarUrl}
                />
                <Heading size="xs">
                  {writer.lastName + ' ' + writer.firstName}
                </Heading>
              </a>
            </Link>
          ) : (
            <Box className={eventCommentStyles.comment_name_wrapper}>
              <Avatar
                minH="20px"
                minW="20px"
                h="20px"
                w="20px"
                rounded="full"
                mr="10px"
                // className={eventCommentStyles.user_avatar}
                src={boldMascot.src}
              />
              <p className={eventCommentStyles.user_name}>ボールドくん</p>
            </Box>
          )}
        </Box>
        <Text fontSize={12}>
          {dateTimeFormatterFromJSDDate({ dateTime: new Date(date) })}
        </Text>
      </Box>
      <Box my={3}>
        <Text wordBreak="break-word" whiteSpace="pre-wrap">
          {body}
        </Text>
      </Box>
      <Divider orientation="horizontal" my={1} w="95%" textAlign="center" />
    </Box>
  );
};

export default CommentCard;
