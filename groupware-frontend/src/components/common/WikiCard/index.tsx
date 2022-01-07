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
      minH="120px"
      shadow="md"
      borderWidth={1}
      borderColor={'gray.200'}
      bg="#ececec"
      py="9px"
      px="16px"
      _hover={{ textDecoration: 'none', cursor: 'pointer' }}>
      <Box
        display="flex"
        flexDir="row"
        alignItems="center"
        mb="16px"
        justifyContent="space-bewtween"
        minH="50%">
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
        {wiki.type === WikiType.BOARD &&
        wiki.boardCategory === BoardCategory.QA ? (
          <Box
            display="flex"
            w="10%"
            flexDir={isSmallerThan768 ? 'column' : 'row'}
            alignItems="center"
            justifyContent="center">
            <Text
              color={darkFontColor}
              fontSize={isSmallerThan768 ? '16px' : '14px'}
              mr={isSmallerThan768 ? '14px' : '16px'}>
              回答
            </Text>
            <Text color="green.500" fontSize="24px" fontWeight="bold">
              {answers?.length.toString()}
            </Text>
          </Box>
        ) : null}
      </Box>
      <Box
        display="flex"
        flexDir={isSmallerThan768 ? 'column' : 'row'}
        justifyContent={isSmallerThan768 ? 'flex-start' : 'space-between'}>
        <Box
          display="flex"
          flexDir="row"
          maxW={isSmallerThan768 ? '100%' : '80%'}
          overflowX="auto"
          mb={isSmallerThan768 ? '8px' : undefined}
          css={hideScrollbarCss}>
          <Link mr="4px" mb="4px" _hover={{ textDecoration: 'none' }}>
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
        {wiki.type !== WikiType.RULES && (
          <Text
            fontSize={isSmallerThan768 ? '14px' : '18px'}
            color={darkFontColor}
            display="flex"
            alignSelf="flex-end"
            mb={isSmallerThan768 ? '24px' : undefined}>
            {dateTimeFormatterFromJSDDate({ dateTime: new Date(createdAt) })}
          </Text>
        )}
      </Box>
    </Link>
  );
};

export default WikiCard;
