import React, { useEffect, useState } from 'react';
import { TextFormat, User, Wiki, WikiType } from 'src/types';
import qaCommentStyles from '@/styles/components/QAComment.module.scss';
import {
  dateTimeFormatterFromJSDDate,
  dateTimeFormatterFromJSDDateWithoutTime,
} from 'src/utils/dateTimeFormatter';
import { Avatar, Box, Button, Text } from '@chakra-ui/react';
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

type WikiCommentProps = {
  textFormat?: TextFormat;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
  writer?: User;
  isWriter?: boolean;
  isExistsBestAnswer?: boolean;
  onClickEditButton?: () => void;
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
  onClickEditButton,
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

  const { mutate } = useAPIToggleGoodForBoard({
    onSuccess: () => {
      setIsPressHeart((prevHeartStatus) => {
        setWikiState((w) => {
          if (w) {
            if (prevHeartStatus) {
              w.userGoodForBoard = w.userGoodForBoard?.filter(
                (u) => u.id !== user?.id,
              );
            } else {
              w.userGoodForBoard = [
                user as User,
                ...(w.userGoodForBoard || []),
              ];
            }
            return w;
          }
        });

        return !prevHeartStatus;
      });
    },
  });

  useEffect(() => {
    setWikiState(wiki);
  }, [wiki]);

  return (
    <>
      {createdAt && updatedAt && writer && (
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
              <Text ml={2} fontSize={'15px'} display="flex" whiteSpace="nowrap">
                {`最終更新: ${dateTimeFormatterFromJSDDateWithoutTime({
                  dateTime: new Date(updatedAt),
                })}`}
              </Text>
            </Box>
            {onClickReplyButton && replyButtonName ? (
              <Button
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
        <Box display="flex" justifyContent={'flex-end'} mt={5}>
          <Link
            onClick={() => {
              mutate(wikiState?.id || 0);
            }}>
            {isPressHeart ? (
              <AiFillHeart size={30} color="red" />
            ) : (
              <AiOutlineHeart size={30} color="black" />
            )}
          </Link>
          <Link onClick={() => setGoodSendersModal(true)}>
            <Button
              colorScheme={'blue'}
              color="white"
              size={
                'sm'
              }>{`${wikiState?.userGoodForBoard?.length}件のいいね`}</Button>
          </Link>
        </Box>
      )}
      <GoodSendersModal
        isOpen={goodSendersModal}
        onClose={() => setGoodSendersModal(false)}
        goodSenders={wikiState?.userGoodForBoard || []}
      />
    </>
  );
};

export default WikiComment;
