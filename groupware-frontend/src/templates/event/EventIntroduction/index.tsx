import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import EventCard from '@/components/common/EventCard';
import { EventIntroduction, EventSchedule } from 'src/types';
import eventTypeNameFactory from 'src/utils/factory/eventTypeNameFactory';

export interface EventIntroductionProps {
  recommendedEvents?: EventSchedule[];
  eventIntroduction: EventIntroduction;
}

const EventIntroductionDisplayer: React.FC<EventIntroductionProps> = ({
  recommendedEvents,
  eventIntroduction,
}) => {
  const eventTypeName = eventIntroduction.type
    ? eventTypeNameFactory(eventIntroduction.type)
    : '';
  return (
    <div className={eventPRStyles.main_wrapper}>
      <div className={eventPRStyles.top_title_wrapper}>
        <p className={eventPRStyles.culture}>culture</p>
        <p className={eventPRStyles.top_title}>{eventTypeName}</p>
      </div>
      <div className={eventPRStyles.top_images_wrapper}>
        <div className={eventPRStyles.main_image_wrapper}>
          <img src={eventIntroduction.imageUrl} alt="" />
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
            <p className={eventPRStyles.title}>{eventIntroduction.title}</p>
          </div>
          <div className={eventPRStyles.description_wrapper}>
            <p className={eventPRStyles.description}>
              {eventIntroduction.description}
            </p>
          </div>
        </div>
        <div className={eventPRStyles.bottom_images_row}>
          {eventIntroduction.eventIntroductionSubImages.map((e) => {
            <div className={eventPRStyles.bottom_image_wrapper}>
              <img src={e.imageUrl} alt="" />
            </div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default EventIntroductionDisplayer;
