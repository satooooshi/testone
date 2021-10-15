import React from 'react';
import { TextFormat, User } from 'src/types';
import qaCommentStyles from '@/styles/components/QAComment.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import '@uiw/react-md-editor/dist/markdown-editor.css';
import '@uiw/react-markdown-preview/dist/markdown.css';
import { Avatar, Button } from '@chakra-ui/react';
import MarkdownIt from 'markdown-it';
import Editor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import DraftMarkup from '../DraftMarkup';
import Link from 'next/link';
import boldMascot from '@/public/bold-mascot.png';

type WikiCommentProps = {
  textFormat?: TextFormat;
  body: string;
  date?: Date;
  writer?: User;
  isWriter?: boolean;
  onClickEditButton?: () => void;
  replyButtonName?: string;
  onClickReplyButton?: () => void;
  bestAnswerButtonName?: string;
  onClickBestAnswerButton?: () => void;
};

const WikiComment: React.FC<WikiCommentProps> = ({
  textFormat,
  body,
  date,
  writer,
  isWriter = false,
  onClickEditButton,
  replyButtonName,
  onClickReplyButton,
  bestAnswerButtonName,
  onClickBestAnswerButton,
}) => {
  const mdParser = new MarkdownIt({ breaks: true });
  return (
    <>
      {date && writer && (
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
            <p className={qaCommentStyles.wrote_date}>
              {dateTimeFormatterFromJSDDate({
                dateTime: new Date(date),
              })}
            </p>
            {isWriter && onClickEditButton ? (
              <Button colorScheme="blue" width="24" onClick={onClickEditButton}>
                編集
              </Button>
            ) : null}
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
        {textFormat && textFormat === 'markdown' ? (
          <Editor
            style={{ border: 'none' }}
            view={{ html: true, menu: false, md: false }}
            renderHTML={() => mdParser.render(body)}
          />
        ) : (
          <DraftMarkup renderHTML={body} />
        )}
        {bestAnswerButtonName && onClickBestAnswerButton ? (
          <div className={qaCommentStyles.best_answer_button_wrapper}>
            <Button
              colorScheme="pink"
              classnames={[qaCommentStyles.best_answer_button]}
              onClick={isWriter ? onClickBestAnswerButton : undefined}>
              {bestAnswerButtonName}
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default WikiComment;
