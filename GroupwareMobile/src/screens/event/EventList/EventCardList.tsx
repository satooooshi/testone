import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {
  useAPIGetEventList,
  SearchQueryToGetEvents,
  EventStatus,
  SearchResultToGetEvents,
} from '../../../hooks/api/event/useAPIGetEventList';
import EventCard from '../../../components/events/EventCard';
import {Div} from 'react-native-magnus';
import {EventListNavigationProps} from '../../../types/navigator/screenProps/Event';
import {useIsFocused} from '@react-navigation/native';

type EventCardListProps = {
  status: EventStatus;
  searchResult?: SearchResultToGetEvents;
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

  useEffect(() => {
    if (isFocused) {
      setSearchQuery(q => ({...q, status}));
    }
  }, [isFocused, setSearchQuery, status]);

  return (
    <Div flexDir="column" alignItems="center">
      <FlatList
        data={searchResult?.events || []}
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
