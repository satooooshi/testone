import React, { useEffect, useMemo, useState } from 'react';
import {
  dateTimeFormatterFromJSDDate,
  dateTimeFormatterFromJSDDateWithoutTime,
} from 'src/utils/dateTimeFormatter';
import { BoardCategory, User, Wiki, WikiType } from 'src/types';
import {
  Badge,
  Box,
  Button,
  Link,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { wikiTypeNameFactory } from 'src/utils/wiki/wikiTypeNameFactory';
import UserAvatar from '../UserAvatar';
import { darkFontColor } from 'src/utils/colors';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import GoodSendersModal from '@/components/wiki/GoodSendersModal';
import { useAPIToggleGoodForBoard } from '@/hooks/api/wiki/useAPIToggleGoodForBoard';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { HiOutlineChevronRight } from 'react-icons/hi';

type WikiCardProps = {
  wiki: Wiki;
  type?: WikiType | undefined;
};

const WikiCard: React.FC<WikiCardProps> = ({ wiki, type }) => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [goodSendersModal, setGoodSendersModal] = useState(false);
  const { user } = useAuthenticate();
  const [wikiState, setWikiState] = useState(wiki);

  const [isPressHeart, setIsPressHeart] = useState<boolean>(
    wikiState.isGoodSender || false,
  );

  const { mutate } = useAPIToggleGoodForBoard({
    onSuccess: () => {
      setIsPressHeart((prevHeartStatus) => {
        setWikiState((w) => {
          if (prevHeartStatus) {
            w.userGoodForBoard = w.userGoodForBoard?.filter(
              (u) => u.id !== user?.id,
            );
          } else {
            w.userGoodForBoard = [user as User, ...(w.userGoodForBoard || [])];
          }
          return w;
        });

        return !prevHeartStatus;
      });
    },
  });

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

  useEffect(() => {
    setWikiState(wiki);
  }, [wiki]);

  return (
    <Box
      w="100%"
      shadow="md"
      borderWidth={1}
      borderColor={'gray.300'}
      bg="white"
      borderRadius={10}
      display="flex"
      flexDir="row"
      p="15px"
      mb={2}
      position="relative">
      <Box display="flex" flexDir="column" minW="95%" maxW={'99%'}>
        <Box display="flex" flexDir={'row'} w="100%" alignItems="center">
          <Text
            fontSize={'15px'}
            color={darkFontColor}
            display="flex"
            whiteSpace="nowrap">
            {`投稿: ${dateTimeFormatterFromJSDDateWithoutTime({
              dateTime: new Date(wikiState.createdAt),
            })}`}
          </Text>
          <Text
            ml={2}
            fontSize={'15px'}
            color={darkFontColor}
            display="flex"
            whiteSpace="nowrap">
            {`最終更新: ${dateTimeFormatterFromJSDDateWithoutTime({
              dateTime: new Date(wikiState.updatedAt),
            })}`}
          </Text>
          <Box
            w="vw"
            pl="16px"
            alignItems="center"
            display="flex"
            flexDir="row"
            overflowX="auto"
            css={hideScrollbarCss}>
            {(!type || type === WikiType.BOARD) && (
              <Link mr="4px" _hover={{ textDecoration: 'none' }}>
                <Button
                  colorScheme={tagButtonColor}
                  variant="outline"
                  size="xs">
                  {wikiTypeNameFactory(
                    wiki.type,
                    wiki.ruleCategory,
                    true,
                    wiki.boardCategory,
                  )}
                </Button>
              </Link>
            )}
            {wikiState.tags && wikiState.tags.length
              ? wikiState.tags.map((t) => (
                  <Link
                    href={`/wiki/list?tag=${t.id}`}
                    key={t.id}
                    mr="4px"
                    _hover={{ textDecoration: 'none' }}>
                    <Badge
                      ml={1}
                      mb={1}
                      p={2}
                      as="sub"
                      fontSize="x-small"
                      display="flex"
                      colorScheme={tagColorFactory(t.type)}
                      borderRadius={50}
                      alignItems="center"
                      variant="outline"
                      borderWidth={1}>
                      {t.name}
                    </Badge>
                  </Link>
                ))
              : null}
          </Box>
        </Box>
        <Text
          mt={2}
          fontSize={isSmallerThan768 ? '16px' : '20px'}
          fontWeight={600}
          display="block"
          w="100%"
          isTruncated
          overflow="hidden">
          {wikiState.title}
        </Text>
        {wikiState.type === WikiType.BOARD ? (
          <Box flexDir="row" display="flex" mt={3} alignItems="center" w="100%">
            {wikiState.writer ? (
              <Link
                href={`/account/${wikiState.writer.id}`}
                passHref
                display="flex"
                flexDir="row"
                alignItems="center"
                _hover={{ textDecoration: 'none' }}>
                <UserAvatar
                  user={wikiState.writer}
                  w="30px"
                  h="30px"
                  rounded="full"
                  mr="8px"
                />
                <Text ml={1} textAlign="center" color={darkFontColor}>
                  {userNameFactory(wikiState.writer)}
                </Text>
              </Link>
            ) : null}
            <Box
              ml="auto"
              mr={5}
              display="flex"
              flexDir="row"
              alignItems="center"
              justifyContent="flex-end">
              <Box
                display="flex"
                flexDir="row"
                alignItems="center"
                justifyContent="center">
                <Link
                  onClick={() => {
                    setGoodSendersModal(true);
                  }}>
                  <Text>いいね</Text>
                </Link>
                <Text mx={1} color="#90CDF4" fontWeight="bold">
                  {wikiState.userGoodForBoard?.length}
                </Text>
                <Text mx={1}>
                  {wiki.boardCategory === BoardCategory.QA
                    ? '回答'
                    : 'コメント'}
                </Text>
                <Text color="#90CDF4" fontWeight="bold">
                  {wikiState.answers?.length}
                </Text>
              </Box>
              <Link
                ml={3}
                position={'relative'}
                onClick={() => {
                  mutate(wikiState.id);
                }}>
                {isPressHeart ? (
                  <AiFillHeart size={20} color="red" />
                ) : (
                  <AiOutlineHeart size={20} color="black" />
                )}
              </Link>
            </Box>
          </Box>
        ) : null}

        <GoodSendersModal
          isOpen={goodSendersModal}
          onClose={() => setGoodSendersModal(false)}
          goodSenders={wiki.userGoodForBoard || []}
        />
        <Box
          display="flex"
          flexDir={isSmallerThan768 ? 'column' : 'row'}
          justifyContent={
            isSmallerThan768 ? 'flex-start' : 'space-between'
          }></Box>
      </Box>
      <Link
        boxSizing="border-box"
        href={`/wiki/detail/${wiki.id}`}
        h="100%"
        ml="auto"
        w="30px"
        display="flex"
        justifyContent="center"
        alignItems="center">
        <Box my="auto" textAlign="center">
          <HiOutlineChevronRight size="30px" color={darkFontColor} />
        </Box>
      </Link>
    </Box>
  );
};

export default WikiCard;
