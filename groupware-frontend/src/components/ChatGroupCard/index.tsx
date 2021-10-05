import React from 'react';
import { ChatGroup, User } from 'src/types';
import chatGroupStyles from '@/styles/components/ChatGroupCard.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Avatar } from '@chakra-ui/react';
import clsx from 'clsx';

type ChatGroupCardProps = {
  chatGroup: ChatGroup;
  isSelected?: boolean;
};

const ChatGroupCard: React.FC<ChatGroupCardProps> = ({
  chatGroup,
  isSelected = false,
}) => {
  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map((m) => m.lastName + m.firstName).toString();
    if (strMembers.length > 15) {
      return strMembers.slice(0, 15) + '...(' + members.length + ')';
    }
    return strMembers.toString();
  };

  return (
    <div
      className={clsx(
        chatGroupStyles.group_card,
        isSelected && chatGroupStyles.group_card__selected,
      )}>
      <div className={chatGroupStyles.avatar}>
        <Avatar src={chatGroup.imageURL} size="md" />
      </div>
      <div className={chatGroupStyles.right}>
        <div className={chatGroupStyles.top}>
          <p className={chatGroupStyles.name}>
            {chatGroup.name
              ? chatGroup.name
              : nameOfEmptyNameGroup(chatGroup.members)}
          </p>
        </div>
        <div className={chatGroupStyles.middle}>
          <p className={chatGroupStyles.latest_message}>
            {chatGroup.chatMessages && chatGroup.chatMessages.length
              ? chatGroup.chatMessages[0].content
              : ' '}
          </p>
        </div>
        <div className={chatGroupStyles.bottom}>
          <p className={chatGroupStyles.date}>
            {dateTimeFormatterFromJSDDate({
              dateTime: new Date(chatGroup.updatedAt),
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatGroupCard;
