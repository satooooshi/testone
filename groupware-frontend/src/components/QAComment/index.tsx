import React from 'react';
import { User } from 'src/types';
import qaCommentStyles from '@/styles/components/QAComment.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import '@uiw/react-md-editor/dist/markdown-editor.css';
import '@uiw/react-markdown-preview/dist/markdown.css';
import { Avatar, Button } from '@chakra-ui/react';
import MarkdownIt from 'markdown-it';
import Editor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

type QACommentProps = {
  body: string;
  date: Date;
  writer: User;
  isWriter?: boolean;
  onClickEditButton?: () => void;
  replyButtonName?: string;
  onClickReplyButton?: () => void;
  bestAnswerButtonName?: string;
  onClickBestAnswerButton?: () => void;
};

const QAComment: React.FC<QACommentProps> = ({
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
    <div className={qaCommentStyles.qa_wrapper}>
      <div className={qaCommentStyles.question_uploader__info}>
        <div className={qaCommentStyles.user_info_wrapper}>
          <Avatar
            className={qaCommentStyles.user_avatar}
            src={writer?.avatarUrl}
          />
          <p className={qaCommentStyles.user_name}>
            {writer?.lastName + ' ' + writer?.firstName}
          </p>
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
      <div className={qaCommentStyles.markdown}>
        <Editor
          style={{ border: 'none' }}
          view={{ html: true, menu: false, md: false }}
          renderHTML={() => mdParser.render(body)}
        />
        {bestAnswerButtonName && onClickBestAnswerButton ? (
          <div className={qaCommentStyles.best_answer_button_wrapper}>
            <Button
              colorScheme="pink"
              classNames={[qaCommentStyles.best_answer_button]}
              onClick={isWriter ? onClickBestAnswerButton : undefined}>
              {bestAnswerButtonName}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default QAComment;
