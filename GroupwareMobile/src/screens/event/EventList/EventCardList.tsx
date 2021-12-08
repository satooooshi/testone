import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {FlatList, Text} from 'react-native';
import {
  SearchQueryToGetEvents,
  EventStatus,
  SearchResultToGetEvents,
} from '../../../hooks/api/event/useAPIGetEventList';
import EventCard from '../../../components/events/EventCard';
import {Div} from 'react-native-magnus';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {EventSchedule} from '../../../types';
import {EventListNavigationProps} from '../../../types/navigator/drawerScreenProps';
import tailwind from 'tailwind-rn';
import {ActivityIndicator} from 'react-native-paper';

type EventCardListProps = {
  status: EventStatus;
  searchResult?: SearchResultToGetEvents;
  searchQuery: SearchQueryToGetEvents;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetEvents>>;
  isLoading: boolean;
};

const EventCardList: React.FC<EventCardListProps> = ({
  status,
  searchResult,
  searchQuery,
  setSearchQuery,
  isLoading,
}) => {
  const navigation = useNavigation<EventListNavigationProps>();
  const [eventsForInfinitScroll, setEventsForInfiniteScroll] = useState<
    EventSchedule[]
  >(searchResult?.events || []);

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useEffect(() => {
    if (searchResult?.events.length) {
      setEventsForInfiniteScroll(e => {
        if (e.length) {
          return [...e, ...searchResult.events];
        }
        return searchResult.events;
      });
    }
  }, [searchResult?.events]);

  useEffect(() => {
    setEventsForInfiniteScroll([]);
  }, [searchQuery.type]);

  useFocusEffect(
    useCallback(() => {
      if (searchQuery.status !== status) {
        setEventsForInfiniteScroll([]);
        setSearchQuery(q => ({
          ...q,
          page: '1',
          from: undefined,
          to: undefined,
          status,
        }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setSearchQuery, status]),
  );

  return (
    <Div flexDir="column" alignItems="center">
      <FlatList
        style={tailwind('h-full')}
        onEndReached={onEndReached}
        data={eventsForInfinitScroll}
        ListEmptyComponent={<Text>検索結果が見つかりませんでした</Text>}
        keyExtractor={item => item.id.toString()}
        renderItem={({item: eventSchedule}) => (
          <Div mb={16}>
            <EventCard
              onPress={e =>
                navigation.navigate('EventStack', {
                  screen: 'EventDetail',
                  params: {id: e.id},
                })
              }
              event={eventSchedule}
            />
          </Div>
        )}
      />
      {isLoading && <ActivityIndicator />}
    </Div>
  );
};

export default EventCardList;
