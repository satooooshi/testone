import React, { useMemo } from 'react';
import userCardStyles from '@/styles/components/UserCard.module.scss';
import { Tag, TagType, User } from 'src/types';
import {
  Box,
  Button,
  Flex,
  Text,
  Image,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import Link from 'next/link';
import UserPointCounter from './UserPointCounter';
import noImage from '@/public/no-image.jpg';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';

type TagCategoryProps = {
  label: string;
  type: TagType;
  color: string;
};

type TagCardProps = {
  tagCategory: TagCategoryProps;
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
const UserCard: React.FC<UserCardProps> = ({ user, onClickTag, duration }) => {
  const groupedTags = useMemo(() => {
    return groupByTagType(user.tags || []);
  }, [user.tags]);

  const tagCategories: TagCategoryProps[] = [
    { label: '技術', type: TagType.TECH, color: 'teal' },
    { label: '資格', type: TagType.QUALIFICATION, color: 'blue' },
    { label: '部活動', type: TagType.CLUB, color: 'green' },
    { label: '趣味', type: TagType.HOBBY, color: 'pink' },
  ];

  const TagCard: React.FC<TagCardProps> = ({ tagCategory }) => {
    return (
      <Flex alignItems="center" mb="4px">
        <p className={userCardStyles.tags_label}>{tagCategory.label}:</p>
        <div className={userCardStyles.tags_wrapper}>
          {groupedTags[tagCategory.type].length ? (
            groupedTags[tagCategory.type].map((t) => (
              <Link passHref href={onClickTag(t)} key={t.id}>
                <Badge
                  mr={2}
                  mb={1}
                  p={2}
                  as="sub"
                  fontSize="x-small"
                  display="flex"
                  colorScheme={tagCategory.color}
                  borderRadius={50}
                  alignItems="center"
                  variant="outline"
                  borderWidth={1}>
                  {t.name}
                </Badge>
              </Link>
            ))
          ) : (
            <Text fontSize={13}>未設定</Text>
          )}
        </div>
      </Flex>
    );
  };

  return (
    <Box bg="white" borderRadius="lg" p="16px">
      <Flex mb="8px">
        <Image
          src={user.avatarUrl}
          fallbackSrc={noImage.src}
          objectFit="cover"
          mr="16px"
          boxSize="160px"
          borderRadius="full"
          alt="アバター画像"
        />
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
          <SimpleGrid
            columns={2}
            bg="gray.100"
            maxWidth="320px"
            spacingX="36px"
            spacingY="12px"
            w="100%"
            borderRadius="lg"
            justifyContent="space-between"
            alignItems="start"
            p="4">
            <SimpleGrid spacingY="12px">
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
            </SimpleGrid>
            <SimpleGrid spacingY="12px">
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
            </SimpleGrid>
          </SimpleGrid>
        </Box>
      </Flex>

      <Box mb="20px">
        {tagCategories.map((t) => (
          <TagCard key={t.label} tagCategory={t} />
        ))}
      </Box>
      <Button
        as="a"
        href={`/account/${user.id}`}
        size="lg"
        rounded="full"
        w="50%"
        fontSize="14px"
        color="blue.600">
        プロフィールを見る
      </Button>
    </Box>
  );
};

export default UserCard;
