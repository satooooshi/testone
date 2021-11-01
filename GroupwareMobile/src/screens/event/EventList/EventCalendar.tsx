import React, {useState, useMemo} from 'react';
import {Calendar, Mode} from 'react-native-big-calendar';
import {Dimensions, ScrollView} from 'react-native';
import {EventSchedule} from '../../../types';
import {
  useAPIGetEventList,
  SearchQueryToGetEvents,
} from '../../../hooks/api/event/useAPIGetEventList';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {eventTypeColorFactory} from '../../../utils/factory/eventTypeColorFactory';

type PersonalCalendarProps = {
  personal?: boolean;
};

const EventCalendar: React.FC<PersonalCalendarProps> = ({personal}) => {
  const [searchQuery] = useState<SearchQueryToGetEvents>({
    from: '',
    to: '',
  });
  const {page, word, tag, status, type, from, to} = searchQuery;
  const {user} = useAuthenticate();
  const {data: events} = useAPIGetEventList({
    page,
    word,
    tag,
    status,
    type,
    from,
    to,
  });
  const [mode] = useState<Mode>('week');

  const memorizedEvent = useMemo<any[]>(() => {
    const changeToBigCalendarEvent = (ev?: EventSchedule[]): any[] => {
      if (ev) {
        if (personal) {
          ev = ev.filter(e => {
            if (
              e.userJoiningEvent?.filter(u => u?.user?.id === user?.id).length
            ) {
              return true;
            }
          });
        }
        const modifiedEvents: any[] = ev.map(e => ({
          ...e,
          start: new Date(e.startAt),
          end: new Date(e.endAt),
        }));
        return modifiedEvents;
      }
      return [];
    };
    return changeToBigCalendarEvent(events?.events);
  }, [events?.events, personal, user?.id]);

  return (
    <>
      <ScrollView>
        <Calendar
          events={memorizedEvent}
          mode={mode}
          height={Dimensions.get('window').height - 60}
          eventCellStyle={event => ({
            backgroundColor: eventTypeColorFactory(event.type),
          })}
        />
      </ScrollView>
    </>
  );
};

export default EventCalendar;
