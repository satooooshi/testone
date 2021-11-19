import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import EventCard from '@/components/common/EventCard';
import { EventIntroduction, EventSchedule } from 'src/types';

export interface EventIntroductionProps {
  recommendedEvents?: EventSchedule[];
}

const EventIntroductionDisplayer: React.FC<
  EventIntroductionProps & Partial<EventIntroduction>
> = ({
  recommendedEvents,
  type,
  title,
  description,
  imageUrl,
  imageUrlSub1,
  imageUrlSub2,
  imageUrlSub3,
  imageUrlSub4,
}) => {
  return (
    <div className={eventPRStyles.main_wrapper}>
      <div className={eventPRStyles.top_title_wrapper}>
        <p className={eventPRStyles.culture}>culture</p>
        <p className={eventPRStyles.top_title}>{type}</p>
      </div>
      <div className={eventPRStyles.top_images_wrapper}>
        <div className={eventPRStyles.main_image_wrapper}>
          <img src={imageUrl} alt="" />
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
            <p className={eventPRStyles.title}>{title}</p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>{description}</p>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub1} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub2} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub3} alt="" />
          </div>
          <div className={eventPRStyles.bottom_image_wrapper}>
            <img src={imageUrlSub4} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventIntroductionDisplayer;
