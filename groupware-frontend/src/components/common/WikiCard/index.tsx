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

type WikiCardProps = {
  wiki: Wiki;
  type: WikiType | undefined;
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
      w={isSmallerThan768 ? '100vw' : 'min(1600px, 70vw)'}
      // minH="104px"
      shadow="md"
      borderWidth={1}
      borderColor={'gray.300'}
      bg="white"
      borderRadius={10}
      display="flex"
      flexDir="column"
      p="15px"
      mb={2}
      position="relative">
      <Link
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        href={`/wiki/detail/${wiki.id}`}
      />

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
              <Button colorScheme={tagButtonColor} variant="outline" size="xs">
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
      {wikiState.type === WikiType.BOARD && (
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
            display="flex"
            flexDir="row"
            alignItems="center"
            justifyContent="flex-end">
            <Link
              onClick={() => {
                setGoodSendersModal(true);
              }}>
              <Box
                display="flex"
                flexDir="row"
                alignItems="center"
                justifyContent="center">
                <Text>いいね</Text>
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
            </Link>
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
            {/* <Box
              mr="16px"
              display="flex"
              flexDir={'row'}
              alignItems="center"
              justifyContent="center">
              <Text color={darkFontColor} mr={'4px'}>
                {wiki.boardCategory === BoardCategory.QA ? '回答' : 'コメント'}
              </Text>
              <Text color="green.500" fontSize="22px" fontWeight="bold">
                {wikiState.answers?.length.toString()}
              </Text>
            </Box> */}
          </Box>
        </Box>
      )}

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
  );
};

export default WikiCard;
