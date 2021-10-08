import LayoutWithTab from '@/components/LayoutWithTab';
import { ScreenName } from '@/components/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import impressiveUniversityImage1 from '@/public/impressive_university_1.png';
import impressiveUniversityImage2 from '@/public/impressive_university_2.png';
import Image from 'next/image';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import EventCard from '@/components/EventCard';

const ImpressionUniversity: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: '感動大学',
    rightButtonName: '予定を見る',
    onClickRightButton: () =>
      router.push('/event/list?type=impressive_university&from=&to='),
  };
  const { data: events } = useAPIGetLatestEvent({
    type: EventType.IMPRESSIVE_UNIVERSITY,
  });

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.EVENT }}
      header={initialHeaderValue}>
      <div className={eventPRStyles.main}>
        <div className={eventPRStyles.top_title_wrapper}>
          <p className={eventPRStyles.culture}>culture</p>
          <p className={eventPRStyles.top_title}>感動大学</p>
        </div>
        <div className={eventPRStyles.top_images_wrapper}>
          <div
            className={eventPRStyles.main_image_wrapper}
            style={{ marginRight: 16 }}>
            <img
              src="https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_univ_main.png"
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
              {'技術力と人間力を\n毎日プロから学ぶことが出来る研修制度'}
            </p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>
              外部講師を招へいし、社員向けに毎日研修を開講しております。技術力はもちろん、マネジメントやコミュニケーション等の人間力に関する研修もエンジニア向けの独自のカリキュラムを企画しております。
              社員の参加率は、常時75％となっており、多くの社員が自己研鑽の面で活用しています。講座数は、年間で200講座程となっており、お客様から頂く声を基にカリキュラムを作成しております。
            </p>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={impressiveUniversityImage1} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <Image src={impressiveUniversityImage2} alt="" />
          </div>
        </div>
      </div>
    </LayoutWithTab>
  );
};

export default ImpressionUniversity;
