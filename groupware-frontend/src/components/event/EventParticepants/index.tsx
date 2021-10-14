import React, { useState } from 'react';
import eventParticipantsStyles from '@/styles/components/EventParticipants.module.scss';
import { UserJoiningEvent } from 'src/types';
import {
  Avatar,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from '@chakra-ui/react';
import Link from 'next/link';

type EventParticipantsProps = {
  userJoiningEvent: UserJoiningEvent[];
  // lateMinutes: number;
};

const EventParticipants: React.FC<EventParticipantsProps> = ({
  userJoiningEvent,
  // lateMinutes,
}) => {
  const [allVisible, setAllVisible] = useState(false);
  const [m, setM] = useState('');
  const lateMinutesText = (v: number) => {
    let message = '';
    const hour = Math.floor(v / 60);
    const minutes = v % 60;
    if (hour) {
      message += `${hour}時間`;
    }
    message += `${minutes}分遅刻`;
    return message;
  };
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
          <div className={eventParticipantsStyles.participant_name_wrapper}>
            <Link key={u.user.id} href={`/account/${u.user.id}`}>
              <a>
                <Avatar
                  src={u.user.avatarUrl}
                  className={eventParticipantsStyles.participant_avatar}
                />
              </a>
            </Link>
            <p className={eventParticipantsStyles.participant_name}>
              {u.user.lastName + ' ' + u.user.firstName}
            </p>
            <Menu>
              <MenuButton as={Button}>
                {m ? lateMinutesText(Number(m)) : '遅刻を記録'}
              </MenuButton>
              <MenuList>
                <MenuOptionGroup
                  onChange={(v) => setM(v)}
                  defaultValue={''}
                  type="radio">
                  <MenuItemOption value="">記録しない</MenuItemOption>
                  <MenuItemOption value="15">15分遅刻</MenuItemOption>
                  <MenuItemOption value="30">30分遅刻</MenuItemOption>
                  <MenuItemOption value="45">45分遅刻</MenuItemOption>
                  <MenuItemOption value="60">1時間遅刻</MenuItemOption>
                  <MenuItemOption value="90">1時間半遅刻</MenuItemOption>
                  <MenuItemOption value="120">2時間以上遅刻</MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </div>
        ) : (
          <></>
        ),
      )}
    </div>
  );
};

export default EventParticipants;
