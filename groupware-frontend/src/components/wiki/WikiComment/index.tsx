import React, { useEffect, useState } from 'react';
import { TextFormat, User, Wiki, WikiType } from 'src/types';
import { dateTimeFormatterFromJSDDateWithoutTime } from 'src/utils/dateTimeFormatter';
import { Avatar, Box, Button, Text, Flex } from '@chakra-ui/react';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import DraftMarkup from '../DraftMarkup';
import boldMascot from '@/public/bold-mascot.png';
import { useAPIToggleGoodForBoard } from '@/hooks/api/wiki/useAPIToggleGoodForBoard';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import GoodSendersModal from '../GoodSendersModal';
import { Link } from '@chakra-ui/react';
import { useAPIGetGoodsForBoard } from '@/hooks/api/wiki/useAPIGetGoodsForBoard';
import { BsReplyFill } from 'react-icons/bs';
import { RiAwardFill, RiAwardLine } from 'react-icons/ri';

type WikiCommentProps = {
  textFormat?: TextFormat;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
  writer?: User;
  isWriter?: boolean;
  isExistsBestAnswer?: boolean;
  onClickReplyButton?: () => void;
  bestAnswerButtonName?: string;
  onClickBestAnswerButton?: () => void;
  wiki?: Wiki;
};

const WikiComment: React.FC<WikiCommentProps> = ({
  textFormat,
  body,
  createdAt,
  updatedAt,
  writer,
  isWriter,
  isExistsBestAnswer,
  onClickReplyButton,
  bestAnswerButtonName,
  onClickBestAnswerButton,
  wiki,
}) => {
  const mdParser = new MarkdownIt({ breaks: true });
  const [wikiState, setWikiState] = useState(wiki);
  const [isPressHeart, setIsPressHeart] = useState<boolean>(
    wiki?.isGoodSender || false,
  );
  const [goodSendersModal, setGoodSendersModal] = useState(false);
  const { user } = useAuthenticate();

  const { mutate: getGoodsForBoard, data: goodsForBoard } =
    useAPIGetGoodsForBoard();
  const { mutate } = useAPIToggleGoodForBoard({
    onSuccess: () => {
      if (wiki) {
        setIsPressHeart((prevHeartStatus) => {
          setWikiState((w) => {
            if (w) {
              return {
                ...w,
                goodsCount: prevHeartStatus
                  ? (w.goodsCount || 0) - 1
                  : (w.goodsCount || 0) + 1,
              };
            }
          });
          return !prevHeartStatus;
        });
      }
    },
  });

  useEffect(() => {
    if (wiki) {
      setWikiState(wiki);
    }
  }, [wiki]);

  return (
    <>
      {createdAt && writer && (
        <Flex row justify="space-between" alignItems="center">
          <Flex row alignItems="center">
            {writer.existence ? (
              <>
                <Link href={`/account/${writer?.id}`} passHref>
                  <a>
                    <Avatar
                      h="40px"
                      w="40px"
                      borderRadius="100%"
                      src={writer.avatarUrl}
                    />
                  </a>
                </Link>
                <Text color="gray" ml="8px">
                  {writer.lastName + ' ' + writer.firstName}
                </Text>
              </>
            ) : (
              <>
                <Avatar
                  h="40px"
                  w="40px"
                  borderRadius="100%"
                  src={boldMascot.src}
                />
                <Text color="gray" ml="8px">
                  ??????????????????
                </Text>
              </>
            )}
          </Flex>

          <Flex row alignItems="center">
            <Box display="flex" flexDir="column" alignItems="end">
              <Text fontSize={'15px'} display="flex" whiteSpace="nowrap">
                {`??????: ${dateTimeFormatterFromJSDDateWithoutTime({
                  dateTime: new Date(createdAt),
                })}`}
              </Text>
              {updatedAt && (
                <Text
                  ml={2}
                  fontSize={'15px'}
                  display="flex"
                  whiteSpace="nowrap">
                  {`????????????: ${dateTimeFormatterFromJSDDateWithoutTime({
                    dateTime: new Date(updatedAt),
                  })}`}
                </Text>
              )}
            </Box>
          </Flex>
        </Flex>
      )}

      <Box color="gray">
        <DraftMarkup
          renderHTML={
            textFormat && textFormat === 'markdown'
              ? mdParser.render(body)
              : body
          }
        />
        <Flex row>
          {onClickReplyButton ? (
            <Button
              mr="8px"
              p={0}
              borderRadius="full"
              borderWidth={1}
              borderColor="gray.300"
              bg="white"
              color="gray"
              onClick={onClickReplyButton}>
              <BsReplyFill />
            </Button>
          ) : null}
          {bestAnswerButtonName && onClickBestAnswerButton ? (
            <Button
              borderWidth={1}
              borderColor={isExistsBestAnswer ? 'green.300' : 'gray.300'}
              color={isExistsBestAnswer ? 'green.300' : 'gray'}
              bg="white"
              borderRadius="2xl"
              leftIcon={isExistsBestAnswer ? <RiAwardFill /> : <RiAwardLine />}
              onClick={isWriter ? onClickBestAnswerButton : undefined}>
              {bestAnswerButtonName}
            </Button>
          ) : null}
        </Flex>
      </Box>
      {wikiState?.type === WikiType.BOARD && (
        <Box
          ml="auto"
          mr={5}
          mt={3}
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
                getGoodsForBoard(wikiState.id);
                setGoodSendersModal(true);
              }}>
              <Text fontSize="20px">{`${wikiState.goodsCount}???????????????`}</Text>
            </Link>
            <Text mx={2} color="#90CDF4" fontWeight="bold" fontSize="20px">
              {wikiState.userGoodForBoard?.length}
            </Text>
          </Box>
          <Link
            ml={3}
            position={'relative'}
            onClick={() => {
              mutate(wikiState.id || 0);
            }}>
            {isPressHeart ? (
              <AiFillHeart size={30} color="red" />
            ) : (
              <AiOutlineHeart size={30} color="black" />
            )}
          </Link>
        </Box>
      )}
      {goodsForBoard && (
        <GoodSendersModal
          isOpen={goodSendersModal}
          onClose={() => setGoodSendersModal(false)}
          goodsForBoard={goodsForBoard}
        />
      )}
    </>
  );
};

export default WikiComment;
