import React, { useMemo } from 'react';
import userCardStyles from '@/styles/components/UserCard.module.scss';
import { Tag, TagType, User } from 'src/types';
import { Avatar, Box, Button, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import UserPointCounter from './UserPointCounter';

type TagLinkProps = {
  tag: Tag;
  onClickTag: (t: Tag) => string;
  tagColor: string;
};

type UserCardProps = {
  user: User;
  onClickTag: (t: Tag) => string;
  duration?: 'week' | 'month';
};

const groupByTagType = (tags: Tag[]): { [k in TagType]: Tag[] } => {
  return tags.reduce<{ [k in TagType]: Tag[] }>(
    (prev, cur) => {
      prev[cur.type].push(cur);
      return prev;
    },
    {
      [TagType.TECH]: [],
      [TagType.CLUB]: [],
      [TagType.QUALIFICATION]: [],
      [TagType.HOBBY]: [],
      [TagType.OTHER]: [],
    },
  );
};

const TagLink: React.FC<TagLinkProps> = ({ tag, onClickTag, tagColor }) => {
  return (
    <Link passHref href={onClickTag(tag)}>
      <a
        onClick={() => onClickTag(tag)}
        className={userCardStyles.tag_item_wrapper}>
        <Button size="xs" colorScheme={tagColor}>
          {tag.name}
        </Button>
      </a>
    </Link>
  );
};

const UserCard: React.FC<UserCardProps> = ({ user, onClickTag, duration }) => {
  const groupedTags = useMemo(() => {
    return groupByTagType(user.tags || []);
  }, [user.tags]);
  return (
    <Box bg="white" borderRadius="8px" p="16px">
      <Flex mb="8px">
        <Avatar size="xl" src={user.avatarUrl} mr="8px" />
        <Box w="100%" overflow="hidden" textOverflow="ellipsis">
          <Text
            fontWeight="bold"
            fontSize="18px"
            mb="4px"
            noOfLines={1}>{`${user.lastName} ${user.firstName}`}</Text>
          <Text
            fontSize="12px"
            color="gray"
            mb="12px"
            noOfLines={1}>{`${user.lastNameKana} ${user.firstNameKana}`}</Text>
          <Box h="40px">
            <Text color="gray" fontSize="14px" noOfLines={2}>{`${
              user.introduceOther || '自己紹介未入力'
            }`}</Text>
          </Box>
          <UserPointCounter
            label="event"
            count={user.eventCount || 0}
            duration={duration}
          />
          <UserPointCounter
            label="question"
            count={user.questionCount || 0}
            duration={duration}
          />
          <UserPointCounter
            label="answer"
            count={user.answerCount || 0}
            duration={duration}
          />
          <UserPointCounter
            label="knowledge"
            count={user.knowledgeCount || 0}
            duration={duration}
          />
        </Box>
      </Flex>

      <Box>
        <div className={userCardStyles.tags_with_label_wrapper}>
          <p className={userCardStyles.tags_label}>技術:</p>
          <div className={userCardStyles.tags_wrapper}>
            {groupedTags[TagType.TECH].length ? (
              groupedTags[TagType.TECH].map((t) => (
                <TagLink
                  key={t.id}
                  tag={t}
                  onClickTag={onClickTag}
                  tagColor="teal"
                />
              ))
            ) : (
              <Button size="xs" colorScheme="teal">
                未設定
              </Button>
            )}
          </div>
        </div>
        <div className={userCardStyles.tags_with_label_wrapper}>
          <p className={userCardStyles.tags_label}>資格:</p>
          <div className={userCardStyles.tags_wrapper}>
            {groupedTags[TagType.QUALIFICATION].length ? (
              groupedTags[TagType.QUALIFICATION].map((t) => (
                <TagLink
                  key={t.id}
                  tag={t}
                  onClickTag={onClickTag}
                  tagColor="blue"
                />
              ))
            ) : (
              <Button size="xs" height="28px" colorScheme="blue">
                未設定
              </Button>
            )}
          </div>
        </div>
        <div className={userCardStyles.tags_with_label_wrapper}>
          <p className={userCardStyles.tags_label}>部活動:</p>
          <div className={userCardStyles.tags_wrapper}>
            {groupedTags[TagType.CLUB].length ? (
              groupedTags[TagType.CLUB].map((t) => (
                <TagLink
                  key={t.id}
                  tag={t}
                  onClickTag={onClickTag}
                  tagColor="green"
                />
              ))
            ) : (
              <Button size="xs" height="28px" colorScheme="green">
                未設定
              </Button>
            )}
          </div>
        </div>
        <div className={userCardStyles.tags_with_label_wrapper}>
          <p className={userCardStyles.tags_label}>趣味:</p>
          <div className={userCardStyles.tags_wrapper}>
            {groupedTags[TagType.HOBBY].length ? (
              groupedTags[TagType.HOBBY].map((t) => (
                <TagLink
                  key={t.id}
                  tag={t}
                  onClickTag={onClickTag}
                  tagColor="pink"
                />
              ))
            ) : (
              <Button size="xs" height="28px" colorScheme="pink">
                未設定
              </Button>
            )}
          </div>
        </div>
        <Button
          as="a"
          href={`/account/${user.id}`}
          size="lg"
          rounded="full"
          w="50%"
          fontSize="16px"
          color="blue.600">
          プロフィールを見る
        </Button>
      </Box>
    </Box>
  );
};

export default UserCard;
