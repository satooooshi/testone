import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import EventCard from '@/components/common/EventCard';

const Coach: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: 'コーチ制度',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=coach&from=&to='),
  };
  const { data: events } = useAPIGetLatestEvent({
    type: EventType.STUDY_MEETING,
  });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={initialHeaderValue}>
      <div className={eventPRStyles.main}>
        <div className={eventPRStyles.top_title_wrapper}>
          <p className={eventPRStyles.culture}>culture</p>
          <p className={eventPRStyles.top_title}>コーチ制度</p>
        </div>
        <div className={eventPRStyles.top_images_wrapper}>
          <div
            className={eventPRStyles.main_image_wrapper}
            style={{ marginRight: 16 }}>
            <img
              src="https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_coach_main.png"
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
              {'エキスパート陣が社員一人ひとりを\nマンツーマンでサポート'}
            </p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>
              大手メーカーやSIにてエンジニアの経験を積み、豊富なマネジメント経験を持つ、アクティブシニアを専任コーチとして再雇用し、社員のスキルアップや現場でのパフォーマンスの最大化を目的にマンツーマンのサポート体制を構築しています。現場経験の豊富なエキスパート陣が、様々な視点から社員へアドバイスや指導を行う事により、お客様へ最高のサービスが実現出来ています。テクニカル面だけでなくメンタルケアの観点からも社員のパフォーマンスに良い影響を与えています。
            </p>
          </div>
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default Coach;
