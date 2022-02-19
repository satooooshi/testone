import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Text} from 'react-native';
import {
  SearchQueryToGetEvents,
  EventStatus,
  useAPIGetEventList,
} from '../../../hooks/api/event/useAPIGetEventList';
import EventCard from '../../../components/events/EventCard';
import {Div} from 'react-native-magnus';
import {AllTag, EventSchedule} from '../../../types';
import tailwind from 'tailwind-rn';
import {ActivityIndicator} from 'react-native-paper';
import {useEventCardListSearchQuery} from '../../../contexts/event/useEventSearchQuery';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import SearchForm from '../../../components/common/SearchForm';
import EventFormModal from '../../../components/events/EventFormModal';
import {useAPICreateEvent} from '../../../hooks/api/event/useAPICreateEvent';
import {responseErrorMsgFactory} from '../../../utils/factory/responseEroorMsgFactory';

type EventCardListProps = {
  status: EventStatus;
  visibleEventFormModal: boolean;
  hideEventFormModal: () => void;
};

const EventCardList: React.FC<EventCardListProps> = ({
  status,
  visibleEventFormModal,
  hideEventFormModal,
}) => {
  const {partOfSearchQuery, setPartOfSearchQuery} =
    useEventCardListSearchQuery();
  const {mutate: saveEvent, isSuccess} = useAPICreateEvent({
    onSuccess: newEvent => {
      Alert.alert('イベントを作成しました。');
      hideEventFormModal();
      if (newEvent.type === partOfSearchQuery.type) {
        setSearchQuery(q => ({...q, page: '1'}));
      }
      setPartOfSearchQuery({refetchNeeded: true});
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
    },
  });
  const {word, tag, type} = partOfSearchQuery;
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetEvents>({
    page: '1',
    word,
    tag,
    status,
    type,
  });
  const {isLoading} = useAPIGetEventList(searchQuery, {
    onSuccess: data => {
      setEventsForInfiniteScroll(e => {
        if (e.length) {
          return [...e, ...data.events];
        }
        return data.events;
      });
    },
  });
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const [eventsForInfinitScroll, setEventsForInfiniteScroll] = useState<
    EventSchedule[]
  >([]);

  const onEndReached = () => {
    setSearchQuery(q => ({
      ...q,
      page: q.page ? (Number(q.page) + 1).toString() : '1',
    }));
  };

  useEffect(() => {
    if (partOfSearchQuery.refetchNeeded) {
      setSearchQuery(q => ({
        ...q,
        page: '1',
      }));
      setPartOfSearchQuery({refetchNeeded: false});
    }
  }, [partOfSearchQuery.refetchNeeded, setPartOfSearchQuery]);

  const queryRefresh = (
    query: Partial<SearchQueryToGetEvents>,
    selectedTags?: AllTag[],
  ) => {
    const selectedTagIDs = selectedTags?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');

    setPartOfSearchQuery({...query, tag: tagQuery || ''});
  };

  useEffect(() => {
    setEventsForInfiniteScroll([]);
    setSearchQuery(q => ({...q, ...partOfSearchQuery, page: '1'}));
  }, [partOfSearchQuery]);

  return (
    <>
      <EventFormModal
        type={partOfSearchQuery.type || undefined}
        isVisible={visibleEventFormModal}
        onCloseModal={hideEventFormModal}
        onSubmit={event => saveEvent(event)}
        isSuccess={isSuccess}
      />
      <SearchForm
        searchTarget="other"
        isVisible={visibleSearchFormModal}
        onClear={() => {
          queryRefresh({word: ''}, []);
          setVisibleSearchFormModal(false);
        }}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        onSubmit={values => {
          queryRefresh({word: values.word}, values.selectedTags);
          setVisibleSearchFormModal(false);
        }}
        defaultSelectedTagIds={partOfSearchQuery.tag
          ?.split('+')
          .map(t => Number(t))}
      />
      <SearchFormOpenerButton
        bottom={10}
        right={10}
        onPress={() => setVisibleSearchFormModal(true)}
      />
      <Div flexDir="column" alignItems="center">
        {eventsForInfinitScroll?.length ? (
          <FlatList
            style={tailwind('h-full pt-4')}
            onEndReached={onEndReached}
            data={eventsForInfinitScroll}
            keyExtractor={item => item.id.toString()}
            renderItem={({item: eventSchedule}) => (
              <Div mb={16}>
                <EventCard event={eventSchedule} />
              </Div>
            )}
          />
        ) : (
          <Text>検索結果が見つかりませんでした</Text>
        )}
        {isLoading && <ActivityIndicator />}
      </Div>
    </>
  );
};

export default EventCardList;
