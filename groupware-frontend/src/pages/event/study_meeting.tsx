import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { ScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import studyMeetingImage1 from '@/public/study_meeting_1.jpg';
import studyMeetingImage2 from '@/public/study_meeting_2.jpg';
import Image from 'next/image';
import EventCard from '@/components/EventCard';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';

const StudyMeeting: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: '勉強会',
    rightButtonName: '予定を見る',
    onClickRightButton: () =>
      router.push('/event/list?type=study_meeting&from=&to='),
  };
  const { data: events } = useAPIGetLatestEvent({
    type: EventType.STUDY_MEETING,
  });
  console.log(events);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.EVENT }}
      header={initialHeaderValue}>
      <div className={eventPRStyles.main}>
        <div className={eventPRStyles.top_title_wrapper}>
          <p className={eventPRStyles.culture}>culture</p>
          <p className={eventPRStyles.top_title}>勉強会</p>
        </div>
        <div className={eventPRStyles.top_images_wrapper}>
          <div
            className={eventPRStyles.main_image_wrapper}
            style={{ marginRight: 16 }}>
            <img
              src="https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_studygroup_main.png"
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
              {'社員同士が教え合いながら、\n知識を深めていく勉強会'}
            </p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>
              各分野に強みを持つベテラン社員が講師となり、8つの勉強会を毎月開催しております。実機環境も完備しており、実践的に学習を進めます。講師を務める社員も、他社員への教育を通して自身の知見を更に深める事が出来ます。毎月の定例の勉強会以外にも、より理解度を高める為に補講を行うこともあります。教え合う風土は、プロジェクト先でのチームワークにも良い影響を与えています。
            </p>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={studyMeetingImage1} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={studyMeetingImage2} alt="" />
          </div>
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default StudyMeeting;
