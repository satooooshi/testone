import React, { useState } from 'react';
import eventParticipantsStyles from '@/styles/components/EventParticipants.module.scss';
import { UserJoiningEvent } from 'src/types';
import { Avatar } from '@chakra-ui/react';
import Link from 'next/link';
import boldMascot from '@/public/bold-mascot.png';

type EventParticipantsProps = {
  userJoiningEvent: UserJoiningEvent[];
};

const EventParticipants: React.FC<EventParticipantsProps> = ({
  userJoiningEvent,
}) => {
  const [allVisible, setAllVisible] = useState(false);
  return (
    <div className={eventParticipantsStyles.participants_area}>
      <div className={eventParticipantsStyles.participant_top}>
        <p className={eventParticipantsStyles.participant_list_title}>
          参加者一覧
        </p>
        {!allVisible && userJoiningEvent.length > 15 ? (
          <button
            className={eventParticipantsStyles.see_all_text}
            onClick={() => setAllVisible(true)}>
            See all
          </button>
        ) : null}
      </div>
      {userJoiningEvent.map((u, index) =>
        index <= 15 || allVisible ? (
          u.user.existence ? (
            <Link key={u.user.id} href={`/account/${u.user.id}`}>
              <a className={eventParticipantsStyles.participant_name_wrapper}>
                <Avatar
                  src={u.user.avatarUrl}
                  className={eventParticipantsStyles.participant_avatar}
                />
                <p className={eventParticipantsStyles.participant_name}>
                  {u.user.lastName + ' ' + u.user.firstName}
                </p>
              </a>
            </Link>
          ) : (
            <div className={eventParticipantsStyles.participant_name_wrapper}>
              <Avatar
                src={boldMascot.src}
                className={eventParticipantsStyles.participant_avatar}
              />
              <p className={eventParticipantsStyles.participant_name}>
                ボールドくん
              </p>
            </div>
          )
        ) : (
          <></>
        ),
      )}
    </div>
  );
};

export default EventParticipants;
