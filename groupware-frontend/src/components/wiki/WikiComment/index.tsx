import React, { useEffect, useState } from 'react';
import { TextFormat, User, Wiki, WikiType } from 'src/types';
import qaCommentStyles from '@/styles/components/QAComment.module.scss';
import {
  dateTimeFormatterFromJSDDate,
  dateTimeFormatterFromJSDDateWithoutTime,
} from 'src/utils/dateTimeFormatter';
import { Avatar, Box, Button, Text, Spinner } from '@chakra-ui/react';

import MarkdownIt from 'markdown-it';
import Editor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import DraftMarkup from '../DraftMarkup';
import boldMascot from '@/public/bold-mascot.png';
import Linkify from 'react-linkify';
import { useAPIToggleGoodForBoard } from '@/hooks/api/wiki/useAPIToggleGoodForBoard';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import GoodSendersModal from '../GoodSendersModal';
import { Link } from '@chakra-ui/react';
import { useAPIGetGoodsForBoard } from '@/hooks/api/wiki/useAPIGetGoodsForBoard';

type WikiCommentProps = {
  textFormat?: TextFormat;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
  writer?: User;
  isWriter?: boolean;
  isExistsBestAnswer?: boolean;
  replyButtonName?: string;
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
  replyButtonName,
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
        <div className={qaCommentStyles.question_uploader__info}>
          <div className={qaCommentStyles.user_info_wrapper}>
            {writer.existence ? (
              <>
                <Link href={`/account/${writer?.id}`} passHref>
                  <a>
                    <Avatar
                      className={qaCommentStyles.user_avatar}
                      src={writer.avatarUrl}
                    />
                  </a>
                </Link>
                <p className={qaCommentStyles.user_name}>
                  {writer.lastName + ' ' + writer.firstName}
                </p>
              </>
            ) : (
              <>
                <Avatar
                  className={qaCommentStyles.user_avatar}
                  src={boldMascot.src}
                />
                <p className={qaCommentStyles.user_name}>ボールドくん</p>
              </>
            )}
          </div>

          <div className={qaCommentStyles.info_left}>
            <Box display="flex" flexDir="column" alignItems="end">
              <Text fontSize={'15px'} display="flex" whiteSpace="nowrap">
                {`投稿: ${dateTimeFormatterFromJSDDateWithoutTime({
                  dateTime: new Date(createdAt),
                })}`}
              </Text>
              {updatedAt && (
                <Text
                  ml={2}
                  fontSize={'15px'}
                  display="flex"
                  whiteSpace="nowrap">
                  {`最終更新: ${dateTimeFormatterFromJSDDateWithoutTime({
                    dateTime: new Date(updatedAt),
                  })}`}
                </Text>
              )}
            </Box>
            {onClickReplyButton && replyButtonName ? (
              <Button
                ml={3}
                // borderRadius={50}
                colorScheme="orange"
                width="24"
                onClick={onClickReplyButton}>
                {replyButtonName}
              </Button>
            ) : null}
          </div>
        </div>
      )}
      <div className={qaCommentStyles.markdown}>
        <DraftMarkup
          renderHTML={
            textFormat && textFormat === 'markdown'
              ? mdParser.render(body)
              : body
          }
        />
        {bestAnswerButtonName && onClickBestAnswerButton ? (
          <div className={qaCommentStyles.best_answer_button_wrapper}>
            <Button
              colorScheme={isExistsBestAnswer ? 'whatsapp' : 'pink'}
              classnames={[qaCommentStyles.best_answer_button]}
              onClick={isWriter ? onClickBestAnswerButton : undefined}>
              {bestAnswerButtonName}
            </Button>
          </div>
        ) : null}
      </div>
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
                setGoodSendersModal(true);
              }}>
              <Text fontSize="20px">いいね</Text>
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
          <Link
            onClick={() => {
              getGoodsForBoard(wikiState.id);
              setGoodSendersModal(true);
            }}>
            <Button colorScheme={'blue'} color="white" size={'sm'}>
              {`${wikiState.goodsCount}件のいいね`}
            </Button>
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
