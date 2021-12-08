import React, {useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import HeaderWithTextButton, {Tab} from '../../../components/Header';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import EventCalendar from './EventCalendar';
import EventCardList from './EventCardList';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import SearchForm from '../../../components/common/SearchForm';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {
  SearchQueryToGetEvents,
  useAPIGetEventList,
} from '../../../hooks/api/event/useAPIGetEventList';
import {AllTag, EventType} from '../../../types';
import eventTypeNameFactory from '../../../utils/factory/eventTypeNameFactory';
import {defaultWeekQuery} from '../../../utils/eventQueryRefresh';
import EventFormModal from '../../../components/events/EventFormModal';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {useAPICreateEvent} from '../../../hooks/api/event/useAPICreateEvent';
import {ActivityIndicator} from 'react-native';
import {Overlay} from 'react-native-magnus';
import {useIsFocused} from '@react-navigation/core';
import {eventTypeColorFactory} from '../../../utils/factory/eventTypeColorFactory';
import {useRoute} from '@react-navigation/native';
import {EventListRouteProps} from '../../../types/navigator/drawerScreenProps';

const TopTab = createMaterialTopTabNavigator();

const EventList: React.FC = () => {
  const isFocused = useIsFocused();
  const {type: typePassedByRoute} = useRoute<EventListRouteProps>().params;
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const {data: tags} = useAPIGetTag();
  const {data: users} = useAPIGetUsers();
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetEvents>(
    defaultWeekQuery(),
  );
  const {
    data: events,
    refetch: refetchEvents,
    isLoading: isLoadingGetEventList,
  } = useAPIGetEventList(searchQuery);
  const [eventsForInfinitScroll, setEventsForInfiniteScroll] = useState(
    events?.events || [],
  );
  const [visibleEventFormModal, setEventFormModal] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const {mutate: saveEvent, isLoading: isLoadingSaveEvent} = useAPICreateEvent({
    onSuccess: () => {
      setEventFormModal(false);
      refetchEvents();
    },
  });
  const tabs: Tab[] = [
    {
      name: 'All',
      onPress: () => queryRefresh({page: '1', type: undefined}),
    },
    {
      name: eventTypeNameFactory(EventType.IMPRESSIVE_UNIVERSITY),
      onPress: () =>
        queryRefresh({page: '1', type: EventType.IMPRESSIVE_UNIVERSITY}),
      color: eventTypeColorFactory(EventType.IMPRESSIVE_UNIVERSITY),
    },
    {
      name: eventTypeNameFactory(EventType.STUDY_MEETING),
      onPress: () => queryRefresh({page: '1', type: EventType.STUDY_MEETING}),
      color: eventTypeColorFactory(EventType.STUDY_MEETING),
    },
    {
      name: eventTypeNameFactory(EventType.BOLDAY),
      onPress: () => queryRefresh({page: '1', type: EventType.BOLDAY}),
      color: eventTypeColorFactory(EventType.BOLDAY),
    },
    {
      name: eventTypeNameFactory(EventType.COACH),
      onPress: () => queryRefresh({page: '1', type: EventType.COACH}),
      color: eventTypeColorFactory(EventType.COACH),
    },
    {
      name: eventTypeNameFactory(EventType.CLUB),
      onPress: () => queryRefresh({page: '1', type: EventType.CLUB}),
      color: eventTypeColorFactory(EventType.CLUB),
    },
    {
      name: eventTypeNameFactory(EventType.SUBMISSION_ETC),
      onPress: () => queryRefresh({page: '1', type: EventType.SUBMISSION_ETC}),
      color: eventTypeColorFactory(EventType.SUBMISSION_ETC),
    },
  ];

  const queryRefresh = (
    query: Partial<SearchQueryToGetEvents>,
    selectedTags?: AllTag[],
  ) => {
    const selectedTagIDs = selectedTags?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');

    setSearchQuery(q => ({...q, ...query, tag: tagQuery || ''}));
  };

  const isCalendar =
    typeof searchQuery.from !== undefined &&
    typeof searchQuery.to !== undefined;

  useEffect(() => {
    if (events?.events && events?.events.length) {
      setEventsForInfiniteScroll(e => {
        if (e.length) {
          return [...e, ...events.events];
        }
        return events.events;
      });
    }
  }, [events?.events]);

  useEffect(() => {
    if (isLoadingGetEventList || isLoadingSaveEvent) {
      setScreenLoading(true);
      return;
    }
    setScreenLoading(false);
  }, [isLoadingGetEventList, isLoadingSaveEvent]);

  useEffect(() => {
    setEventsForInfiniteScroll([]);
  }, [
    searchQuery.word,
    searchQuery.status,
    searchQuery.type,
    searchQuery.tag,
    isCalendar,
  ]);

  useEffect(() => {
    if (typePassedByRoute) {
      setSearchQuery(q => ({...q, type: typePassedByRoute}));
    }
  }, [typePassedByRoute]);

  useEffect(() => {
    if (isFocused) {
      refetchEvents();
    }
  }, [isFocused, refetchEvents]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="Events"
        tabs={tabs}
        activeTabName={
          searchQuery.type ? eventTypeNameFactory(searchQuery.type) : 'All'
        }
        rightButtonName="新規イベント"
        onPressRightButton={() => setEventFormModal(true)}
      />
      <Overlay visible={screenLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <EventFormModal
        isVisible={visibleEventFormModal}
        onCloseModal={() => setEventFormModal(false)}
        onSubmit={event => saveEvent(event)}
        users={users || []}
        tags={tags || []}
      />
      {!isCalendar && (
        <SearchFormOpenerButton
          bottom={10}
          right={10}
          onPress={() => setVisibleSearchFormModal(true)}
        />
      )}
      <SearchForm
        isVisible={visibleSearchFormModal}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        tags={tags || []}
        onSubmit={values => {
          queryRefresh({word: values.word}, values.selectedTags);
          setVisibleSearchFormModal(false);
        }}
      />
      <TopTab.Navigator
        initialRouteName={'EventCalendar'}
        screenOptions={{
          tabBarScrollEnabled: true,
        }}>
        <TopTab.Screen
          name="PersonalCalendar"
          children={() => (
            <EventCalendar
              searchResult={events}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              personal={true}
            />
          )}
          options={{title: 'カレンダー(個人)'}}
        />
        <TopTab.Screen
          name="EventCalendar"
          children={() => (
            <EventCalendar
              searchResult={events}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: 'カレンダー'}}
        />
        <TopTab.Screen
          name="FutureEvents"
          children={() => (
            <EventCardList
              searchResult={eventsForInfinitScroll}
              status="future"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: '今後のイベント'}}
        />
        <TopTab.Screen
          name="PastEvents"
          children={() => (
            <EventCardList
              searchResult={eventsForInfinitScroll}
              status="past"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: '過去のイベント'}}
        />
        <TopTab.Screen
          name="CurrentEvents"
          children={() => (
            <EventCardList
              searchResult={eventsForInfinitScroll}
              status="current"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: '現在のイベント'}}
        />
      </TopTab.Navigator>
    </WholeContainer>
  );
};

export default EventList;
