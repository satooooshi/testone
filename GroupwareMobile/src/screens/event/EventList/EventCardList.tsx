import React, {Dispatch, SetStateAction, useCallback} from 'react';
import {FlatList, Text} from 'react-native';
import {
  SearchQueryToGetEvents,
  EventStatus,
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
  searchResult?: EventSchedule[];
  setEvents: Dispatch<SetStateAction<EventSchedule[]>>;
  searchQuery: SearchQueryToGetEvents;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetEvents>>;
  isLoading: boolean;
};

const EventCardList: React.FC<EventCardListProps> = ({
  status,
  searchResult,
  setEvents,
  searchQuery,
  setSearchQuery,
  isLoading,
}) => {
  const navigation = useNavigation<EventListNavigationProps>();

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useFocusEffect(
    useCallback(() => {
      if (searchQuery.status !== status) {
        setEvents([]);
        setSearchQuery(q => ({
          ...q,
          page: '1',
          from: undefined,
          to: undefined,
          status,
        }));
      }
    }, [searchQuery.status, setEvents, setSearchQuery, status]),
  );

  return (
    <Div flexDir="column" alignItems="center">
      {searchResult?.length ? (
        <FlatList
          style={tailwind('h-full')}
          onEndReached={onEndReached}
          data={searchResult}
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
      ) : (
        <Text>検索結果が見つかりませんでした</Text>
      )}
      {isLoading && <ActivityIndicator />}
    </Div>
  );
};

export default EventCardList;
