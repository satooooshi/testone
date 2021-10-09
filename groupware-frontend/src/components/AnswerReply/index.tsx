import React from 'react';
import { QAAnswerReply } from 'src/types';
import '@uiw/react-md-editor/dist/markdown-editor.css';
import '@uiw/react-markdown-preview/dist/markdown.css';
import answerReplyStyles from '@/styles/components/AnswerReply.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Avatar } from '@chakra-ui/react';
import QAComment from '../QAComment';

type AnswerReplyProps = {
  reply: QAAnswerReply;
};

const AnswerReply: React.FC<AnswerReplyProps> = ({ reply }) => {
  return (
    <div className={answerReplyStyles.reply}>
      <div className={answerReplyStyles.uploader__info}>
        <div className={answerReplyStyles.user_info_wrapper}>
          <Avatar
            className={answerReplyStyles.user_avatar}
            src={reply.writer?.avatarUrl}
          />
          <p className={answerReplyStyles.user_name}>
            {reply.writer?.lastName + ' ' + reply.writer?.firstName}
          </p>
        </div>
        <p className={answerReplyStyles.wrote_date}>
          {dateTimeFormatterFromJSDDate({
            dateTime: new Date(reply.createdAt),
            format: 'yyyy/LL/dd HH:mm:ss',
          })}
        </p>
      </div>
      <QAComment editorLanguage={reply.editorLanguage} body={reply.body} />
    </div>
  );
};

export default AnswerReply;
