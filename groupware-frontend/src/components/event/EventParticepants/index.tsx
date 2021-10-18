import React, { useState } from 'react';
import eventParticipantsStyles from '@/styles/components/EventParticipants.module.scss';
import { UserJoiningEvent, UserRole } from 'src/types';
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from '@chakra-ui/react';
import Link from 'next/link';
import boldMascot from '@/public/bold-mascot.png';
import { useAuthenticate } from 'src/contexts/useAuthenticate';

type EventParticipantsProps = {
  userJoiningEvent: UserJoiningEvent[];
  onChangeJoiningData: (uje: UserJoiningEvent) => void;
};

const EventParticipants: React.FC<EventParticipantsProps> = ({
  userJoiningEvent,
  onChangeJoiningData,
}) => {
  const [allVisible, setAllVisible] = useState(false);
  const { user } = useAuthenticate();
  const lateMinutesText = (v: number) => {
    if (!v) {
      return '遅刻を記録';
    }
    let message = '';
    const hour = Math.floor(v / 60);
    const minutes = v % 60;
    if (hour) {
      message += `${hour}時間`;
    }
    if (minutes) {
      message += `${minutes}分`;
    }
    return `${message}遅刻`;
  };
  return (
    <div className={eventParticipantsStyles.participants_area}>
      <div className={eventParticipantsStyles.participant_top}>
        <p className={eventParticipantsStyles.participant_list_title}>
          参加者一覧
        </p>
        {!allVisible && userJoiningEvent && userJoiningEvent.length > 15 ? (
          <button
            className={eventParticipantsStyles.see_all_text}
            onClick={() => setAllVisible(true)}>
            See all
          </button>
        ) : null}
      </div>
      {!userJoiningEvent.length && (
        <div className={eventParticipantsStyles.participant_name_wrapper}>
          <a className={eventParticipantsStyles.user_info_wrapper}>
            <p className={eventParticipantsStyles.participant_name}>
              まだ参加申し込みされていません
            </p>
          </a>
        </div>
      )}
      {userJoiningEvent.map((u, index) =>
        index <= 15 || allVisible ? (
          u.user.existence ? (
            <div className={eventParticipantsStyles.participant_name_wrapper}>
              <Link key={u.user.id} href={`/account/${u.user.id}`}>
                <a className={eventParticipantsStyles.participant_info_wrapper}>
                  <Avatar
                    src={u.user.avatarUrl}
                    className={eventParticipantsStyles.participant_avatar}
                  />
                  <p className={eventParticipantsStyles.participant_name}>
                    {u.user.lastName + ' ' + u.user.firstName}
                  </p>
                </a>
              </Link>
              {user?.role === UserRole.ADMIN && (
                <Menu>
                  <MenuButton as={Button} colorScheme="red" size="sm">
                    {u.lateMinutes
                      ? lateMinutesText(Number(u.lateMinutes))
                      : '遅刻を記録'}
                  </MenuButton>
                  <MenuList>
                    <MenuOptionGroup
                      onChange={(v) =>
                        onChangeJoiningData({ ...u, lateMinutes: Number(v) })
                      }
                      defaultValue={''}
                      value={u.lateMinutes.toString()}
                      type="radio">
                      <MenuItemOption value="">記録しない</MenuItemOption>
                      <MenuItemOption value="15">15分遅刻</MenuItemOption>
                      <MenuItemOption value="30">30分遅刻</MenuItemOption>
                      <MenuItemOption value="45">45分遅刻</MenuItemOption>
                      <MenuItemOption value="60">1時間遅刻</MenuItemOption>
                      <MenuItemOption value="90">1時間半遅刻</MenuItemOption>
                      <MenuItemOption value="120">2時間遅刻</MenuItemOption>
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              )}
            </div>
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
