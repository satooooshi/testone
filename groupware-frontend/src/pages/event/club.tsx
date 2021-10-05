import LayoutWithTab from '@/components/LayoutWithTab';
import { ScreenName } from '@/components/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import clubImage2 from '@/public/club_2.jpg';
import clubImage3 from '@/public/club_3.png';
import clubImage4 from '@/public/club_4.jpg';
import clubImage5 from '@/public/club_5.jpg';
import clubImage6 from '@/public/club_6.jpg';
import Image from 'next/image';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import EventCard from '@/components/EventCard';

const Club: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: '部活動',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=club&from=&to='),
  };
  const { data: events } = useAPIGetLatestEvent({
    type: EventType.STUDY_MEETING,
  });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.EVENT }}
      header={initialHeaderValue}>
      <div className={eventPRStyles.main}>
        <div className={eventPRStyles.top_title_wrapper}>
          <p className={eventPRStyles.culture}>culture</p>
          <p className={eventPRStyles.top_title}>部活動/サークル</p>
        </div>
        <div className={eventPRStyles.top_images_wrapper}>
          <div
            className={eventPRStyles.main_image_wrapper}
            style={{ marginRight: 16 }}>
            <Image src={clubImage5} alt="" />
          </div>
        </div>
        <div className={eventPRStyles.latest_events_wrapper}>
          {events?.length ? (
            <p className={eventPRStyles.latest_events_text}>
              直近のおすすめイベント
            </p>
          ) : (
            <p className={eventPRStyles.no_latest_event_text}>
              直近一週間にイベントはありません
            </p>
          )}
          <div className={eventPRStyles.event_card_list}>
            {events?.map(
              (eventSchedule, index) =>
                index <= 4 && (
                  <div
                    key={eventSchedule.id}
                    className={eventPRStyles.event_card}>
                    <EventCard eventSchedule={eventSchedule} />
                  </div>
                ),
            )}
          </div>
        </div>
        <div className={eventPRStyles.info_wrapper}>
          <div className={eventPRStyles.title_wrapper}>
            <p className={eventPRStyles.title}>{'23の部活動、サークル'}</p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>
              ボールドでは現在、ボルダリング、バスケ、バドミントンといった運動系の部活をはじめ、
              麻雀、アナログゲーム、写真といった文化系など、
              全部で9の部活と11のサークルがあり、
              月1程度で週末に集まって活動しています。
              （ちなみに時々新しいサークルが生まれ、だんだんと増え続けています。
              　先日はサバゲ―サークルが発足しました）
              メンバーはもちろん、その部に所属していない人も自由に参加できるので、
              毎回違うメンバーで盛り上がっています！
            </p>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={clubImage3} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={clubImage4} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={clubImage6} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={clubImage2} alt="" />
          </div>
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default Club;
