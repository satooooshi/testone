import React, { useEffect, useMemo, useState } from 'react';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { BoardCategory, User, Wiki, WikiType } from 'src/types';
import { Box, Button, Link, Text, useMediaQuery } from '@chakra-ui/react';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { wikiTypeNameFactory } from 'src/utils/wiki/wikiTypeNameFactory';
import UserAvatar from '../UserAvatar';
import { darkFontColor } from 'src/utils/colors';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import GoodSendersModal from '@/components/wiki/GoodSendersModal';
import { useAPIToggleGoodForBoard } from '@/hooks/api/wiki/useAPIToggleGoodForBoard';
import { useAuthenticate } from 'src/contexts/useAuthenticate';

type WikiCardProps = {
  wiki: Wiki;
};

const WikiCard: React.FC<WikiCardProps> = ({ wiki }) => {
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
        <Box w="90%" display="flex" alignItems="center">
          {wiki.type !== WikiType.RULES && wikiState.writer ? (
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
          ) : null}
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
                  setGoodSendersModal(true);
                }}>
                <Button
                  colorScheme={'blue'}
                  color="white"
                  size={
                    'sm'
                  }>{`${wikiState.userGoodForBoard?.length}件のいいね`}</Button>
              </Link>
            </Box>
          )}
          {wiki.type === WikiType.BOARD &&
          wiki.boardCategory === BoardCategory.QA ? (
            <Box
              mr="16px"
              display="flex"
              flexDir={'row'}
              alignItems="center"
              justifyContent="center">
              <Text color={darkFontColor} mr={'4px'}>
                回答
              </Text>
              <Text color="green.500" fontSize="22px" fontWeight="bold">
                {wikiState.answers?.length.toString()}
              </Text>
            </Box>
          ) : null}
          <Text fontSize={'16px'} color={darkFontColor} display="flex">
            {dateTimeFormatterFromJSDDate({
              dateTime: new Date(wikiState.createdAt),
            })}
          </Text>
        </Box>
      </Box>

      <GoodSendersModal
        isOpen={goodSendersModal}
        onClose={() => setGoodSendersModal(false)}
        goodSenders={wiki.userGoodForBoard || []}
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
