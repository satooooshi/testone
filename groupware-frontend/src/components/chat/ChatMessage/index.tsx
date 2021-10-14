import { Link } from '@chakra-ui/react';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { AiOutlineFileProtect } from 'react-icons/ai';
import { Avatar } from '@chakra-ui/react';
import { ChatMessage, ChatMessageType, LastReadChatTime } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import chatStyles from '@/styles/layouts/Chat.module.scss';

type ChatMessageProps = {
  message: ChatMessage;
  lastReadChatTime: LastReadChatTime[];
};

const ChatMessage: React.FC<ChatMessageProps> = ({
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
      <div
        key={message.id}
        className={clsx(
          chatStyles.message__item,
          message.isSender
            ? chatStyles.message__self
            : chatStyles.message__other,
        )}>
        {!message.isSender ? (
          <Link href={`/account/${message.sender?.id}`} passHref>
            <Avatar
              className={chatStyles.group_card_avatar_image}
              src={message.sender?.avatarUrl}
            />
          </Link>
        ) : null}
        <div className={chatStyles.message_wrapper}>
          {message.isSender && (
            <div>
              {messageReadCount(message) ? (
                <p className={chatStyles.read_count}>
                  既読
                  {messageReadCount(message)}
                </p>
              ) : null}
              <p className={chatStyles.send_time}>
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(message.createdAt),
                  format: 'HH:mm',
                })}
              </p>
            </div>
          )}
          <div
            className={clsx(
              chatStyles.message_user_info_wrapper,
              message.isSender && chatStyles.message_user_info_wrapper__self,
            )}>
            <p className={chatStyles.massage_sender_name}>
              {message.sender ? userNameFactory(message.sender) : ''}
            </p>
            {message.type === ChatMessageType.TEXT ? (
              <p
                className={clsx(
                  chatStyles.message_content,
                  message.isSender
                    ? chatStyles.message_text__self
                    : chatStyles.message_text__other,
                )}>
                {mentionTransform(message.content)}
              </p>
            ) : (
              <span className={chatStyles.message_content}>
                {message.type === ChatMessageType.IMAGE ? (
                  <span className={chatStyles.message_image_or_video}>
                    <img
                      src={message.content}
                      width={300}
                      height={300}
                      alt="image"
                    />
                  </span>
                ) : message.type === ChatMessageType.VIDEO ? (
                  <span className={chatStyles.message_image_or_video}>
                    <video
                      src={message.content}
                      controls
                      width={300}
                      height={300}
                    />
                  </span>
                ) : (
                  <div className={chatStyles.message_other_file}>
                    <AiOutlineFileProtect
                      className={chatStyles.other_file_icon}
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
            <p className={chatStyles.send_time}>
              {dateTimeFormatterFromJSDDate({
                dateTime: new Date(message.createdAt),
                format: 'HH:mm',
              })}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatMessage;
