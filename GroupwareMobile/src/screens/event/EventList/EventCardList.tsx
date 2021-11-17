import React, {Dispatch, SetStateAction, useEffect} from 'react';
import {FlatList} from 'react-native';
import {
  SearchQueryToGetEvents,
  EventStatus,
  SearchResultToGetEvents,
} from '../../../hooks/api/event/useAPIGetEventList';
import EventCard from '../../../components/events/EventCard';
import {Div} from 'react-native-magnus';
import {EventListNavigationProps} from '../../../types/navigator/screenProps/Event';
import {useIsFocused} from '@react-navigation/native';
import {EventSchedule} from '../../../types';

type EventCardListProps = {
  status: EventStatus;
  searchResult?: EventSchedule[];
  navigation: EventListNavigationProps;
  searchQuery: SearchQueryToGetEvents;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetEvents>>;
};

const EventCardList: React.FC<EventCardListProps> = ({
  status,
  navigation,
  searchResult,
  setSearchQuery,
}) => {
  const isFocused = useIsFocused();

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useEffect(() => {
    if (isFocused) {
      setSearchQuery(q => ({...q, from: undefined, to: undefined, status}));
    }
  }, [isFocused, setSearchQuery, status]);

  return (
    <Div flexDir="column" alignItems="center">
      <FlatList
        onEndReached={onEndReached}
        data={searchResult || []}
        keyExtractor={item => item.id.toString()}
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
