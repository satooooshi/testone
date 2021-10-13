import React from 'react';
import { ChatMessage, ChatMessageType } from 'src/types';
import mentionMessageCardStyles from '@/styles/components/MentionMessageCard.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { mentionTransform } from 'src/utils/mentionTransform';
import { Avatar } from '@chakra-ui/react';

type MentionMessageCardProps = {
  message: ChatMessage;
};

const MentionMessageCard: React.FC<MentionMessageCardProps> = ({ message }) => {
  return (
    <div className={mentionMessageCardStyles.card}>
      <div className={mentionMessageCardStyles.top}>
        <div className={mentionMessageCardStyles.user_info}>
          <Avatar
            src={message.sender?.avatarUrl}
            className={mentionMessageCardStyles.avatar}
          />
          <p className={mentionMessageCardStyles.user_name}>
            {`${message.sender?.lastName} ${message.sender?.firstName}`}
          </p>
        </div>
        <p className={mentionMessageCardStyles.date}>
          {dateTimeFormatterFromJSDDate({
            dateTime: new Date(message.createdAt),
            format: 'yyyy/LL/dd HH:mm:ss',
          })}
        </p>
      </div>
      {message.type === ChatMessageType.TEXT ? (
        <p className={mentionMessageCardStyles.content}>
          {mentionTransform(message.content)}
        </p>
      ) : message.type === ChatMessageType.IMAGE ? (
        <p className={mentionMessageCardStyles.content}>画像</p>
      ) : (
        <p className={mentionMessageCardStyles.content}>動画</p>
      )}
    </div>
  );
};

export default MentionMessageCard;
