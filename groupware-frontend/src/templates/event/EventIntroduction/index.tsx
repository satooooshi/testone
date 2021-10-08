import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import EventCard from '@/components/EventCard';
import { EventTab } from 'src/types/header/tab/types';
import { EachEventData } from 'src/types/event/eventIntroduction/types';
import Image from 'next/image';

const EventIntroduction: React.FC<EachEventData> = ({
  events,
  bottomImages,
  imgUrl,
  subHeading,
  content,
}) => {
  return (
    <>
      <div className={eventPRStyles.top_title_wrapper}>
        <p className={eventPRStyles.culture}>culture</p>
        <p className={eventPRStyles.top_title}>
          {EventTab.IMPRESSIVE_UNIVERSITY}
        </p>
      </div>
      <div className={eventPRStyles.top_images_wrapper}>
        <div
          className={eventPRStyles.main_image_wrapper}
          style={{ marginRight: 16 }}>
          <img src={imgUrl} alt="" />
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
        <div className={eventPRStyles.info_wrapper}>
          <div className={eventPRStyles.title_wrapper}>
            <p className={eventPRStyles.title}>{subHeading}</p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>{content}</p>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          {bottomImages.map((i, id) => (
            <div key={id} className={eventPRStyles.bottom_image_wrapper}>
              <Image src={i} alt="" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EventIntroduction;
