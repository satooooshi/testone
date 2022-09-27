import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import EventCard from '@/components/common/EventCard';
import { EventIntroduction, EventSchedule } from 'src/types';
import eventTypeNameFactory from 'src/utils/factory/eventTypeNameFactory';
import Image from 'next/image';
import { SimpleGrid } from '@chakra-ui/react';

export interface EventIntroductionProps {
  recommendedEvents?: EventSchedule[];
  eventIntroduction: EventIntroduction;
  headlineImgSource: StaticImageData | string;
  bottomImgSources: (StaticImageData | string)[];
}

const EventIntroductionViewer: React.FC<EventIntroductionProps> = ({
  recommendedEvents,
  eventIntroduction,
  headlineImgSource,
  bottomImgSources,
}) => {
  return (
    <div className={eventPRStyles.main_wrapper}>
      <div className={eventPRStyles.top_title_wrapper}>
        <p className={eventPRStyles.culture}>culture</p>
        <p className={eventPRStyles.top_title}>
          {eventTypeNameFactory(eventIntroduction.type)}
        </p>
      </div>
      <div className={eventPRStyles.top_images_wrapper}>
        <div className={eventPRStyles.main_image_wrapper}>
          {typeof headlineImgSource === 'string' ? (
            <img src={headlineImgSource} alt="" />
          ) : (
            <Image src={headlineImgSource} alt="" />
          )}
        </div>
      </div>

      <div className={eventPRStyles.latest_events_wrapper}>
        {recommendedEvents?.length ? (
          <>
            <p className={eventPRStyles.latest_events_text}>
              直近のおすすめイベント
            </p>
            <div className={eventPRStyles.event_card_list}>
              <SimpleGrid
                w="100%"
                minChildWidth="360px"
                maxChildWidth="420px"
                spacing="20px">
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
              </SimpleGrid>
            </div>
          </>
        ) : (
          <p className={eventPRStyles.no_latest_event_text}>
            直近一週間にイベントはありません
          </p>
        )}

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
          {bottomImgSources?.map((bottomImgSource, id) => (
            <div key={id} className={eventPRStyles.bottom_image_wrapper}>
              {typeof bottomImgSource === 'string' ? (
                <img src={bottomImgSource} alt="" />
              ) : (
                <Image src={bottomImgSource} alt="" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventIntroductionViewer;
