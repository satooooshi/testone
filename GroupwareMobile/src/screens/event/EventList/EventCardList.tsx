import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Text} from 'react-native';
import {
  SearchQueryToGetEvents,
  EventStatus,
} from '../../../hooks/api/event/useAPIGetEventList';
import EventCard from '../../../components/events/EventCard';
import {Div} from 'react-native-magnus';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {EventSchedule} from '../../../types';
import {EventListNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {genKeyQueryFromObjArr} from '../../../utils/genKeyQueryFromObjArr';
import SearchForm from '../../../components/common/SearchForm';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import tailwind from 'tailwind-rn';

type EventCardListProps = {
  status: EventStatus;
  searchResult?: EventSchedule[];
  searchQuery: SearchQueryToGetEvents;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetEvents>>;
  isLoading: boolean;
};

const EventCardList: React.FC<EventCardListProps> = ({
  status,
  searchResult,
  setSearchQuery,
  isLoading,
}) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<EventListNavigationProps>();

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useEffect(() => {
    if (isFocused) {
      setSearchQuery(q => ({
        ...q,
        page: '1',
        from: undefined,
        to: undefined,
        status,
      }));
    }
  }, [isFocused, setSearchQuery, status]);

  return (
    <Div flexDir="column" alignItems="center">
      {!isLoading && searchResult ? (
        <FlatList
          style={tailwind('h-full')}
          onEndReached={onEndReached}
          data={searchResult || []}
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
      ) : null}
      {isLoading && <ActivityIndicator />}
    </Div>
  );
};

export default EventCardList;
