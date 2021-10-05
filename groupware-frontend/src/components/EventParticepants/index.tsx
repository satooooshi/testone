import React, { useState } from 'react';
import eventParticipantsStyles from '@/styles/components/EventParticipants.module.scss';
import { User } from 'src/types';
import { Avatar } from '@chakra-ui/react';
import Link from 'next/link';

type EventParticipantsProps = {
  participants: User[];
};

const EventParticipants: React.FC<EventParticipantsProps> = ({
  participants,
}) => {
  const [allVisible, setAllVisible] = useState(false);
  return (
    <div className={eventParticipantsStyles.participants_area}>
      <div className={eventParticipantsStyles.participant_top}>
        <p className={eventParticipantsStyles.participant_list_title}>
          参加者一覧
        </p>
        {!allVisible && participants.length > 15 ? (
          <button
            className={eventParticipantsStyles.see_all_text}
            onClick={() => setAllVisible(true)}>
            See all
          </button>
        ) : null}
      </div>
      {participants.map((u, index) =>
        index <= 15 || allVisible ? (
          <Link key={u.id} href={`/account/${u.id}`}>
            <a className={eventParticipantsStyles.participant_name_wrapper}>
              <Avatar
                src={u.avatarUrl}
                className={eventParticipantsStyles.participant_avatar}
              />
              <p className={eventParticipantsStyles.participant_name}>
                {u.lastName + ' ' + u.firstName}
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
