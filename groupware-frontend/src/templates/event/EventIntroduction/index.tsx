import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import EventCard from '@/components/EventCard';
import Image from 'next/image';
import { EventSchedule } from 'src/types';
import { EventTab } from 'src/types/header/tab/types';

export interface EventIntroductionData {
  recommendedEvents?: EventSchedule[];
  headlineImage: React.ReactNode | StaticImageData;
  bottomImages: (React.ReactNode | StaticImageData)[];
  heading: EventTab;
  subHeading: string;
  content: string;
}


const EventIntroduction: React.FC<EventIntroductionData> = ({
  recommendedEvents,
  headlineImage,
  bottomImages,
  heading,
  subHeading,
  content,
}) => {
  return (
    <>
      <div className={eventPRStyles.top_title_wrapper}>
        <p className={eventPRStyles.culture}>culture</p>
        <p className={eventPRStyles.top_title}>{heading}</p>
      </div>
      <div className={eventPRStyles.top_images_wrapper}>
        <div
          className={eventPRStyles.main_image_wrapper}
          style={{ marginRight: 16 }}>
          {headlineImage}
        </div>
      </div>
      <div className={eventPRStyles.latest_events_wrapper}>
        {recommendedEvents?.length ? (
          <p className={eventPRStyles.latest_events_text}>
            直近のおすすめイベント
          </p>
        ) : (
          <p className={eventPRStyles.no_latest_event_text}>
            直近一週間にイベントはありません
          </p>
        )}
        <div className={eventPRStyles.event_card_list}>
          {recommendedEvents?.map(
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
          {bottomImages.map((bottomImage, id) => (
            <div key={id} className={eventPRStyles.bottom_image_wrapper}>
              {bottomImage}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EventIntroduction;
