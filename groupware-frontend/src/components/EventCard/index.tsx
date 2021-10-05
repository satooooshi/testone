import React from 'react';
import eventCardStyles from '@/styles/components/EventCard.module.scss';
import { EventSchedule, Tag } from 'src/types';
import clsx from 'clsx';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import Link from 'next/link';
import { Button } from '@chakra-ui/react';
import noImage from '@/public/no-image.jpg';
import Image from 'next/image';

type EventCardProps = {
  eventSchedule: EventSchedule;
  hrefTagClick?: (t: Tag) => string;
};

const EventCard: React.FC<EventCardProps> = ({
  eventSchedule,
  hrefTagClick,
}) => {
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
              <Image src={noImage} alt="イベント画像" />
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
              <p className={eventCardStyles.event_card_date}>
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(eventSchedule.startAt),
                  format: '開始: yyyy/LL/dd HH:mm ~',
                })}
              </p>
              <p className={eventCardStyles.event_card_date}>
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(eventSchedule.endAt),
                  format: '終了: yyyy/LL/dd HH:mm',
                })}
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
                    <Button height="28px" colorScheme="purple">
                      {t.name}
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <Button
                height="28px"
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
