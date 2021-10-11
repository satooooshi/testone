import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { ScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import boldayImage1 from '@/public/bolday_1.jpg';
import boldayImage2 from '@/public/bolday_2.jpg';
import boldayImage3 from '@/public/bolday_3.jpg';
import boldayImage4 from '@/public/bolday_4.jpg';
import Image from 'next/image';
import EventCard from '@/components/EventCard';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';

const Bolday: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: 'BOLDay',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=bolday&from=&to='),
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
          <p className={eventPRStyles.top_title}>BOLDay</p>
        </div>
        <div className={eventPRStyles.top_images_wrapper}>
          <div
            className={eventPRStyles.main_image_wrapper}
            style={{ marginRight: 16 }}>
            <img
              src="https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_balday_main.png"
              alt=""
            />
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
            <p className={eventPRStyles.title}>
              {'社員同士が高めあう風土が生まれる帰社日'}
            </p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>
              月に一度全社員が一堂に会する帰社日『BOLDay』を開催し、社員同士の繋がりを深めています。様々なプロジェクトで活躍する社員同士がコミュニケーションをとることが出来る場となっており、社員それぞれが持つノウハウの共有が行われます。
              また、BOLDayではゲストを招へいしワークショップを行ったり、様々なテーマを基にグループワークを行ったりする為、社員にとって自己研鑽の場としても活用されています。社員数が何名になっても全社員で開催していきたいと考えております。
            </p>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={boldayImage1} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={boldayImage2} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={boldayImage4} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={boldayImage3} alt="" />
          </div>
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default Bolday;
