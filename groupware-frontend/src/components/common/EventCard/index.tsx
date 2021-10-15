import React, { useMemo } from 'react';
import eventCardStyles from '@/styles/components/EventCard.module.scss';
import { EventSchedule, EventType, Tag } from 'src/types';
import clsx from 'clsx';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import Link from 'next/link';
import { Button } from '@chakra-ui/react';
import noImage from '@/public/no-image.jpg';
import boldayImage1 from '@/public/bolday_1.jpg';
import impressiveUnivertyImage from '@/public/impressive_university_1.png';
import studyMeeting1Image from '@/public/study_meeting_1.jpg';
import Image from 'next/image';
import { GiTeacher } from 'react-icons/gi';
import portalLinkBoxStyles from '@/styles/components/PortalLinkBox.module.scss';
import { MdAssignment } from 'react-icons/md';
import { FcSportsMode } from 'react-icons/fc';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';

type EventCardProps = {
  eventSchedule: EventSchedule;
  hrefTagClick?: (t: Tag) => string;
};

const EventCard: React.FC<EventCardProps> = ({
  eventSchedule,
  hrefTagClick,
}) => {
  const imageSource = useMemo(() => {
    switch (eventSchedule.type) {
      case EventType.STUDY_MEETING:
        return <Image src={studyMeeting1Image} alt="イベント画像" />;
      case EventType.BOLDAY:
        return <Image src={boldayImage1} alt="イベント画像" />;
      case EventType.CLUB:
        return (
          <FcSportsMode
            className={clsx(
              eventCardStyles.icon,
              portalLinkBoxStyles.club_icon,
            )}
          />
        );
      case EventType.IMPRESSIVE_UNIVERSITY:
        return <Image src={impressiveUnivertyImage} alt="イベント画像" />;
      case EventType.COACH:
        return (
          <GiTeacher
            className={clsx(
              eventCardStyles.icon,
              portalLinkBoxStyles.coach_icon,
            )}
          />
        );
      case EventType.SUBMISSION_ETC:
        return (
          <MdAssignment
            className={clsx(
              eventCardStyles.icon,
              portalLinkBoxStyles.submission_etc_icon,
            )}
          />
        );

      default:
        return <Image src={noImage} alt="イベント画像" />;
    }
  }, [eventSchedule.type]);

  return (
    <Link href={`/event/${eventSchedule.id}`}>
      <a className={clsx(eventCardStyles.event_card)}>
        <div className={eventCardStyles.top}>
          <div className={eventCardStyles.image_wrapper}>
            {eventSchedule.imageURL ? (
              <img
                src={eventSchedule.imageURL}
                alt="イベント画像"
                className={eventCardStyles.image}
              />
            ) : (
              imageSource
            )}
          </div>
          <div className={eventCardStyles.event_card_right}>
            <div className={eventCardStyles.title_description_wrapper}>
              <p className={eventCardStyles.event_card_title}>
                {eventSchedule.title}
              </p>
              <p className={eventCardStyles.event_card_description}>
                {eventSchedule.description}
              </p>
            </div>
            <div className={eventCardStyles.event_card_title_date__wrapper}>
              {eventSchedule.type !== EventType.SUBMISSION_ETC && (
                <p className={eventCardStyles.event_card_date}>
                  {dateTimeFormatterFromJSDDate({
                    dateTime: new Date(eventSchedule.startAt),
                    format: '開始: yyyy/LL/dd HH:mm ~',
                  })}
                </p>
              )}
              <p className={eventCardStyles.event_card_date}>
                {`
                  ${
                    eventSchedule.type !== EventType.SUBMISSION_ETC
                      ? '終了'
                      : '締切'
                  }: ${dateTimeFormatterFromJSDDate({
                  dateTime: new Date(eventSchedule.endAt),
                  format: 'yyyy/LL/dd HH:mm',
                })}
                `}
              </p>
            </div>
          </div>
        </div>
        <div className={eventCardStyles.bottom}>
          <div className={eventCardStyles.event_card_tag}>
            {eventSchedule.tags && eventSchedule.tags.length ? (
              eventSchedule.tags.map((t) => (
                <div
                  key={t.id}
                  className={eventCardStyles.event_card_tag__item}>
                  <Link
                    passHref
                    href={
                      hrefTagClick ? hrefTagClick(t) : `/event/list?tag=${t.id}`
                    }
                    key={t.id}>
                    <Button size="sm" colorScheme={tagColorFactory(t.type)}>
                      {t.name}
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <Button
                size="sm"
                colorScheme="purple"
                className={eventCardStyles.event_card_tag__item}>
                {'タグなし'}
              </Button>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default EventCard;
