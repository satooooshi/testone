import React from 'react';
import { QAAnswerReply } from 'src/types';
import '@uiw/react-md-editor/dist/markdown-editor.css';
import '@uiw/react-markdown-preview/dist/markdown.css';
import answerReplyStyles from '@/styles/components/AnswerReply.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Avatar } from '@chakra-ui/react';
import WikiComment from '../WikiComment';
import Link from 'next/link';
import boldMascot from '@/public/bold-mascot.png';

type AnswerReplyProps = {
  reply: QAAnswerReply;
};

const AnswerReply: React.FC<AnswerReplyProps> = ({ reply }) => {
  return (
    <div className={answerReplyStyles.reply}>
      <div className={answerReplyStyles.uploader__info}>
        <div className={answerReplyStyles.user_info_wrapper}>
          {reply.writer?.existence ? (
            <>
              <Link
                key={reply.writer?.id}
                href={`/account/${reply.writer?.id}`}
                passHref>
                <a>
                  <Avatar
                    className={answerReplyStyles.user_avatar}
                    src={reply.writer?.avatarUrl}
                  />
                </a>
              </Link>
              <p className={answerReplyStyles.user_name}>
                {reply.writer?.lastName + ' ' + reply.writer?.firstName}
              </p>
            </>
          ) : (
            <>
              <Avatar
                className={answerReplyStyles.user_avatar}
                src={boldMascot.src}
              />
              <p className={answerReplyStyles.user_name}>ボールドくん</p>
            </>
          )}
        </div>
        <p className={answerReplyStyles.wrote_date}>
          {dateTimeFormatterFromJSDDate({
            dateTime: new Date(reply.createdAt),
            format: 'yyyy/LL/dd HH:mm:ss',
          })}
        </p>
      </div>
      <div className={answerReplyStyles.qa_reply_wrapper}>
        <WikiComment textFormat={reply.textFormat} body={reply.body} />
      </div>
    </div>
  );
};

export default AnswerReply;
