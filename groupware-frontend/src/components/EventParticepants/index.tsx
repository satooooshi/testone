import React, { useState } from 'react';
import eventParticipantsStyles from '@/styles/components/EventParticipants.module.scss';
import { UserJoiningEvent } from 'src/types';
import { Avatar } from '@chakra-ui/react';
import Link from 'next/link';

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
          <Link key={u.users.id} href={`/account/${u.users.id}`}>
            <a className={eventParticipantsStyles.participant_name_wrapper}>
              <Avatar
                src={u.users.avatarUrl}
                className={eventParticipantsStyles.participant_avatar}
              />
              <p className={eventParticipantsStyles.participant_name}>
                {u.users.lastName + ' ' + u.users.firstName}
              </p>
            </a>
          </Link>
        ) : (
          <></>
        ),
      )}
    </div>
  );
};

export default EventParticipants;
