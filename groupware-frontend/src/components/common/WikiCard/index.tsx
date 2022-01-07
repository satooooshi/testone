import React, { useMemo } from 'react';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { BoardCategory, Wiki, WikiType } from 'src/types';
import { Box, Button, Link, Text, useMediaQuery } from '@chakra-ui/react';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { wikiTypeNameFactory } from 'src/utils/wiki/wikiTypeNameFactory';
import UserAvatar from '../UserAvatar';
import { darkFontColor } from 'src/utils/colors';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';

type WikiCardProps = {
  wiki: Wiki;
};

const WikiCard: React.FC<WikiCardProps> = ({ wiki }) => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { title, writer, tags, createdAt, answers } = wiki;
  const tagButtonColor = useMemo(() => {
    switch (wiki.type) {
      case WikiType.BOARD:
        return 'yellow';
      case WikiType.ALL_POSTAL:
        return 'orange';
      case WikiType.RULES:
        return 'green';
    }
  }, [wiki.type]);

  return (
    <Link
      href={`/wiki/detail/${wiki.id}`}
      w={isSmallerThan768 ? '100vw' : 'min(1600px, 70vw)'}
      minH="104px"
      shadow="md"
      borderWidth={1}
      borderColor={'gray.300'}
      bg="#ececec"
      py="4px"
      _hover={{ textDecoration: 'none', cursor: 'pointer' }}>
      <Box
        px="16px"
        display="flex"
        flexDir="row"
        alignItems="center"
        mb="8px"
        justifyContent="space-bewtween">
        <Box w="90%" display="flex" alignItems="center">
          {wiki.type !== WikiType.RULES && writer ? (
            <Link
              href={`/account/${writer.id}`}
              passHref
              _hover={{ textDecoration: 'none' }}>
              <UserAvatar
                user={writer}
                w="40px"
                h="40px"
                rounded="full"
                mr="8px"
              />
            </Link>
          ) : null}
          <Text
            color={darkFontColor}
            fontSize={isSmallerThan768 ? '16px' : '20px'}
            fontWeight={600}
            display="block"
            w="100%"
            isTruncated
            overflow="hidden">
            {title}
          </Text>
        </Box>
      </Box>
      <Box
        mb="8px"
        px="8px"
        flexDir="row"
        display="flex"
        alignItems="center"
        justifyContent="flex-end">
        {wiki.type === WikiType.BOARD &&
        wiki.boardCategory === BoardCategory.QA ? (
          <Box
            mr="8px"
            display="flex"
            flexDir={'row'}
            alignItems="center"
            justifyContent="center">
            <Text color={darkFontColor} mr={'4px'}>
              回答
            </Text>
            <Text color="green.500" fontSize="22px" fontWeight="bold">
              {answers?.length.toString()}
            </Text>
          </Box>
        ) : null}
        {wiki.type !== WikiType.RULES && (
          <Text
            fontSize={isSmallerThan768 ? '14px' : '18px'}
            color={darkFontColor}
            display="flex">
            {dateTimeFormatterFromJSDDate({ dateTime: new Date(createdAt) })}
          </Text>
        )}
      </Box>
      <Box
        display="flex"
        flexDir={isSmallerThan768 ? 'column' : 'row'}
        justifyContent={isSmallerThan768 ? 'flex-start' : 'space-between'}>
        <Box
          pl="16px"
          display="flex"
          flexDir="row"
          overflowX="auto"
          css={hideScrollbarCss}>
          <Link mr="4px" _hover={{ textDecoration: 'none' }}>
            <Button colorScheme={tagButtonColor} color="white" size="xs">
              {wikiTypeNameFactory(
                wiki.type,
                wiki.ruleCategory,
                true,
                wiki.boardCategory,
              )}
            </Button>
          </Link>
          {tags && tags.length
            ? tags.map((t) => (
                <Link
                  href={`/wiki/list?tag=${t.id}`}
                  key={t.id}
                  mr="4px"
                  _hover={{ textDecoration: 'none' }}>
                  <Button colorScheme={tagColorFactory(t.type)} size="xs">
                    {t.name}
                  </Button>
                </Link>
              ))
            : null}
        </Box>
      </Box>
    </Link>
  );
};

export default WikiCard;
