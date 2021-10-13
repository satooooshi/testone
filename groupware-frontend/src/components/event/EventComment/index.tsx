import { User } from 'src/types';
import eventCommentStyles from '@/styles/components/EventComment.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Avatar } from 'react-rainbow-components';
import Link from 'next/link';

type EventCommentCardProps = {
  body: string;
  date: Date;
  writer: User;
};
const EventCommentCard: React.FC<EventCommentCardProps> = ({
  body,
  date,
  writer,
}) => {
  return (
    <div className={eventCommentStyles.card_wrapper}>
      <div className={eventCommentStyles.comment_uploader_info}>
        <div className={eventCommentStyles.user_info_wrapper}>
          <Link key={writer?.id} href={`/account/${writer?.id}`} passHref>
            <a>
              <Avatar
                className={eventCommentStyles.user_avatar}
                src={writer.avatarUrl}
              />
            </a>
          </Link>
          <p className={eventCommentStyles.user_name}>
            {writer.lastName + ' ' + writer.firstName}
          </p>
        </div>
        <p className={eventCommentStyles.wrote_date}>
          {dateTimeFormatterFromJSDDate({ dateTime: new Date(date) })}
        </p>
      </div>
      <div className={eventCommentStyles.comment_body}>
        <p className={eventCommentStyles.comment_text}>{body}</p>
      </div>
    </div>
  );
};

export default EventCommentCard;
