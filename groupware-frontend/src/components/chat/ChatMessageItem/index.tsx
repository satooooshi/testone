import { Link } from '@chakra-ui/react';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { AiOutlineFileProtect } from 'react-icons/ai';
import { Avatar } from '@chakra-ui/react';
import { ChatMessage, ChatMessageType, LastReadChatTime } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import chatMessageItemStyles from '@/styles/components/chat/ChatMessageItem.module.scss';
import boldMascot from '@/public/bold-mascot.png';

type ChatMessageItemProps = {
  message: ChatMessage;
  lastReadChatTime: LastReadChatTime[];
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  lastReadChatTime,
}) => {
  const messageReadCount = useCallback(
    (message: ChatMessage): number => {
      return lastReadChatTime?.filter((l) => l.readTime >= message.updatedAt)
        .length;
    },
    [lastReadChatTime],
  );

  return (
    <>
      {message.type === ChatMessageType.SYSTEM_TEXT && (
        <div
          className={clsx(
            chatMessageItemStyles.system_message_wrapper,
            chatMessageItemStyles.message__item,
          )}>
          <p className={chatMessageItemStyles.system_message}>
            {message.content}
          </p>
        </div>
      )}
      {message.type !== ChatMessageType.SYSTEM_TEXT && (
        <div
          key={message.id}
          className={clsx(
            chatMessageItemStyles.message__item,
            message.isSender
              ? chatMessageItemStyles.message__self
              : chatMessageItemStyles.message__other,
          )}>
          {!message.isSender ? (
            <Link href={`/account/${message.sender?.id}`} passHref>
              <Avatar
                className={chatMessageItemStyles.group_card_avatar_image}
                src={
                  !message.sender?.existence
                    ? boldMascot.src
                    : message.sender?.avatarUrl
                }
              />
            </Link>
          ) : null}
          <div className={chatMessageItemStyles.message_wrapper}>
            {message.isSender && (
              <div>
                {messageReadCount(message) ? (
                  <p className={chatMessageItemStyles.read_count}>
                    既読
                    {messageReadCount(message)}
                  </p>
                ) : null}
                <p className={chatMessageItemStyles.send_time}>
                  {dateTimeFormatterFromJSDDate({
                    dateTime: new Date(message.createdAt),
                    format: 'HH:mm',
                  })}
                </p>
              </div>
            )}
            <div
              className={clsx(chatMessageItemStyles.message_user_info_wrapper)}>
              <p className={chatMessageItemStyles.massage_sender_name}>
                {message.sender && message.sender?.existence
                  ? userNameFactory(message.sender)
                  : 'ボールドくん'}
              </p>
              {message.type === ChatMessageType.TEXT ? (
                <p
                  className={clsx(
                    chatMessageItemStyles.message_content,
                    message.isSender
                      ? chatMessageItemStyles.message_text__self
                      : chatMessageItemStyles.message_text__other,
                  )}>
                  {mentionTransform(message.content)}
                </p>
              ) : (
                <span className={chatMessageItemStyles.message_content}>
                  {message.type === ChatMessageType.IMAGE ? (
                    <span
                      className={chatMessageItemStyles.message_image_or_video}>
                      <img
                        src={message.content}
                        width={300}
                        height={300}
                        alt="image"
                      />
                    </span>
                  ) : message.type === ChatMessageType.VIDEO ? (
                    <span
                      className={chatMessageItemStyles.message_image_or_video}>
                      <video
                        src={message.content}
                        controls
                        width={300}
                        height={300}
                      />
                    </span>
                  ) : (
                    <div className={chatMessageItemStyles.message_other_file}>
                      <AiOutlineFileProtect
                        className={chatMessageItemStyles.other_file_icon}
                      />
                      <p>
                        {
                          (message.content.match('.+/(.+?)([?#;].*)?$') || [
                            '',
                            message.content,
                          ])[1]
                        }
                      </p>
                    </div>
                  )}
                </span>
              )}
            </div>
            {!message.isSender && (
              <p className={chatMessageItemStyles.send_time}>
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(message.createdAt),
                  format: 'HH:mm',
                })}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessageItem;
