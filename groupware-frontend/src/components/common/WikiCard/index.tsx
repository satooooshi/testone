import React, { useEffect, useMemo, useState } from 'react';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { BoardCategory, User, Wiki, WikiType } from 'src/types';
import {
  Box,
  Button,
  Link,
  Spinner,
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
import { useAPIGetGoodsForBoard } from '@/hooks/api/wiki/useAPIGetGoodsForBoard';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type WikiCardProps = {
  wiki: Wiki;
};

const WikiCard: React.FC<WikiCardProps> = ({ wiki }) => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [goodSendersModal, setGoodSendersModal] = useState(false);
  const { user } = useAuthenticate();
  const [wikiState, setWikiState] = useState(wiki);

  const [isPressHeart, setIsPressHeart] = useState<boolean>(false);

  const tagButtonColor = useMemo(() => {
    switch (wiki.type) {
      case WikiType.BOARD:
        return 'yellow';
      case WikiType.ALL_POSTAL:
        return 'orange';
      case WikiType.RULES:
        return 'green';
      case WikiType.MAIL_MAGAZINE:
        return 'blue';
    }
  }, [wiki.type]);

  const { mutate: getGoodsForBoard, data: goodsForBoard } =
    useAPIGetGoodsForBoard();
  const { mutate } = useAPIToggleGoodForBoard({
    onSuccess: () => {
      setIsPressHeart((prevHeartStatus) => {
        setWikiState((w) => {
          return {
            ...w,
            goodsCount: prevHeartStatus
              ? (w.goodsCount || 0) - 1
              : (w.goodsCount || 0) + 1,
          };
        });
        return !prevHeartStatus;
      });
    },
  });

  useEffect(() => {
    setWikiState(wiki);
    setIsPressHeart(wiki.isGoodSender || false);
  }, [wiki]);

  return (
    <Box
      w={isSmallerThan768 ? '100vw' : 'min(1600px, 70vw)'}
      minH="104px"
      shadow="md"
      borderWidth={1}
      borderColor={'gray.300'}
      bg="#ececec"
      py="4px"
      position="relative">
      <Link
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        href={`/wiki/detail/${wiki.id}`}
      />

      <Box
        px="16px"
        display="flex"
        flexDir="row"
        alignItems="center"
        mb="8px"
        justifyContent="space-bewtween">
        <Box display={'flex'} flexDir={'column'} width={'100%'}>
          {wiki.type !== WikiType.RULES && wikiState.writer ? (
            <Box display={'flex'} w={'50%'} mb={1} alignItems={'center'}>
              <Link
                href={`/account/${wikiState.writer.id}`}
                passHref
                _hover={{ textDecoration: 'none' }}>
                <UserAvatar
                  user={wikiState.writer}
                  w="40px"
                  h="40px"
                  rounded="full"
                  mr="8px"
                />
              </Link>
              <Text>{userNameFactory(wikiState.writer)}</Text>
            </Box>
          ) : null}

          <Box w="80%" display="flex" alignItems="center">
            <Text
              color={darkFontColor}
              fontSize={isSmallerThan768 ? '16px' : '20px'}
              fontWeight={600}
              display="block"
              w="100%"
              isTruncated
              overflow="hidden">
              {wikiState.title}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box
        mb="8px"
        px="8px"
        flexDir="row"
        display="flex"
        alignItems="center"
        justifyContent="flex-end">
        <Box display="flex" flexDir="row" height={5} alignItems="center">
          {wikiState.type === WikiType.BOARD && (
            <Box display="flex" mr={3}>
              <Link
                position={'relative'}
                onClick={() => {
                  mutate(wikiState.id);
                }}>
                {isPressHeart ? (
                  <AiFillHeart size={30} color="red" />
                ) : (
                  <AiOutlineHeart size={30} color="black" />
                )}
              </Link>
              <Link
                onClick={() => {
                  getGoodsForBoard(wikiState.id);
                  setGoodSendersModal(true);
                }}>
                <Button colorScheme={'blue'} color="white" size={'sm'}>
                  {`${wikiState.goodsCount || 0}件のいいね`}
                </Button>
              </Link>
            </Box>
          )}
          {wiki.type === WikiType.BOARD ? (
            <Box
              mr="16px"
              display="flex"
              flexDir={'row'}
              alignItems="center"
              justifyContent="center">
              <Text color={darkFontColor} mr={'4px'}>
                {wiki.boardCategory === BoardCategory.QA ? '回答' : 'コメント'}
              </Text>
              <Text color="green.500" fontSize="22px" fontWeight="bold">
                {wikiState.answersCount || 0}
              </Text>
            </Box>
          ) : null}
          <Box display="flex" flexDir={'column'} alignItems="end">
            <Text fontSize={'16px'} color={darkFontColor} display="flex">
              {`投稿日: ${dateTimeFormatterFromJSDDate({
                dateTime: new Date(wikiState.createdAt),
              })}`}
            </Text>
            <Text fontSize={'16px'} color={darkFontColor} display="flex">
              {`最終更新日: ${dateTimeFormatterFromJSDDate({
                dateTime: new Date(wikiState.updatedAt),
              })}`}
            </Text>
          </Box>
        </Box>
      </Box>

      <GoodSendersModal
        isOpen={goodSendersModal}
        onClose={() => setGoodSendersModal(false)}
        goodsForBoard={goodsForBoard || []}
      />
      <Box
        display="flex"
        flexDir={isSmallerThan768 ? 'column' : 'row'}
        justifyContent={isSmallerThan768 ? 'flex-start' : 'space-between'}>
        <Box
          w="vw"
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
          {wikiState.tags && wikiState.tags.length
            ? wikiState.tags.map((t) => (
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
    </Box>
  );
};

export default WikiCard;
