import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {
  useAPIGetEventList,
  SearchQueryToGetEvents,
  EventStatus,
} from '../../../hooks/api/event/useAPIGetEventList';
import EventCard from '../../../components/events/EventCard';
import {Div} from 'react-native-magnus';
import {EventListNavigationProps} from '../../../types/navigator/screenProps/Event';

type EventCardListProps = {
  type: EventStatus;
  navigation: EventListNavigationProps;
};

const EventCardList: React.FC<EventCardListProps> = ({type, navigation}) => {
  const [searchQuery] = useState<SearchQueryToGetEvents>({
    page: '1',
    status: type,
  });
  const {data: events} = useAPIGetEventList(searchQuery);
  return (
    <Div flexDir="column" alignItems="center">
      <FlatList
        data={events?.events || []}
        renderItem={({item: eventSchedule}) => (
          <Div mb={16}>
            <EventCard
              onPress={e => navigation.navigate('EventDetail', {id: e.id})}
              event={eventSchedule}
            />
          </Div>
        )}
      />
    </Div>
  );
};

export default EventCardList;
