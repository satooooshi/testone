import React, {useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import HeaderWithTextButton from '../../../components/Header';
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
import {AllTag, EventSchedule, EventType} from '../../../types';
import eventTypeNameFactory from '../../../utils/factory/eventTypeNameFactory';
import {defaultWeekQuery} from '../../../utils/eventQueryRefresh';
import EventFormModal from '../../../components/events/EventFormModal';
import {useAPICreateEvent} from '../../../hooks/api/event/useAPICreateEvent';
import {useIsFocused} from '@react-navigation/core';
import {eventTypeColorFactory} from '../../../utils/factory/eventTypeColorFactory';
import {useRoute} from '@react-navigation/native';
import {EventListRouteProps} from '../../../types/navigator/drawerScreenProps';
import {Tab} from '../../../components/Header/HeaderTemplate';

const TopTab = createMaterialTopTabNavigator();

const EventList: React.FC = () => {
  const isFocused = useIsFocused();
  const typePassedByRoute = useRoute<EventListRouteProps>()?.params?.type;
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const {data: tags} = useAPIGetTag();
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetEvents>(
    defaultWeekQuery(),
  );
  const {
    data: events,
    refetch: refetchEvents,
    isLoading: isLoadingGetEventList,
  } = useAPIGetEventList(searchQuery);
  const [visibleEventFormModal, setEventFormModal] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const {mutate: saveEvent, isLoading: isLoadingSaveEvent} = useAPICreateEvent({
    onSuccess: () => {
      setEventFormModal(false);
      if (isCalendar) {
        refetchEvents();
      } else {
      }
    },
  });
  const [eventsForInfinitScroll, setEventsForInfiniteScroll] = useState<
    EventSchedule[]
  >(events?.events || []);
  const tabs: Tab[] = [
    {
      name: 'All',
      onPress: () => queryRefresh({page: '1', type: undefined}),
    },
    {
      name: eventTypeNameFactory(EventType.IMPRESSIVE_UNIVERSITY),
      onPress: () =>
        queryRefresh({page: '1', type: EventType.IMPRESSIVE_UNIVERSITY}),
      borderBottomColor: eventTypeColorFactory(EventType.IMPRESSIVE_UNIVERSITY),
    },
    {
      name: eventTypeNameFactory(EventType.STUDY_MEETING),
      onPress: () => queryRefresh({page: '1', type: EventType.STUDY_MEETING}),
      borderBottomColor: eventTypeColorFactory(EventType.STUDY_MEETING),
    },
    {
      name: eventTypeNameFactory(EventType.BOLDAY),
      onPress: () => queryRefresh({page: '1', type: EventType.BOLDAY}),
      borderBottomColor: eventTypeColorFactory(EventType.BOLDAY),
    },
    {
      name: eventTypeNameFactory(EventType.COACH),
      onPress: () => queryRefresh({page: '1', type: EventType.COACH}),
      borderBottomColor: eventTypeColorFactory(EventType.COACH),
    },
    {
      name: eventTypeNameFactory(EventType.CLUB),
      onPress: () => queryRefresh({page: '1', type: EventType.CLUB}),
      borderBottomColor: eventTypeColorFactory(EventType.CLUB),
    },
    {
      name: eventTypeNameFactory(EventType.SUBMISSION_ETC),
      onPress: () => queryRefresh({page: '1', type: EventType.SUBMISSION_ETC}),
      borderBottomColor: eventTypeColorFactory(EventType.SUBMISSION_ETC),
    },
  ];

  const queryRefresh = (
    query: Partial<SearchQueryToGetEvents>,
    selectedTags?: AllTag[],
  ) => {
    const selectedTagIDs = selectedTags?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');
    setEventsForInfiniteScroll([]);

    setSearchQuery(q => ({...q, ...query, tag: tagQuery || ''}));
  };

  const isCalendar =
    searchQuery.from !== undefined && searchQuery.to !== undefined;

  useEffect(() => {
    if (isLoadingGetEventList || isLoadingSaveEvent) {
      setScreenLoading(true);
      return;
    }
    setScreenLoading(false);
  }, [isLoadingGetEventList, isLoadingSaveEvent]);

  useEffect(() => {
    if (events?.events) {
      setEventsForInfiniteScroll(e => {
        if (e.length) {
          return [...e, ...events.events];
        }
        return events.events;
      });
    }
  }, [events?.events]);

  useEffect(() => {
    if (isFocused) {
      refetchEvents();
    }
  }, [isFocused, refetchEvents]);

  useEffect(() => {
    if (typePassedByRoute) {
      setSearchQuery(q => ({...q, type: typePassedByRoute}));
    }
  }, [typePassedByRoute]);

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
      <EventFormModal
        type={searchQuery.type || undefined}
        isVisible={visibleEventFormModal}
        onCloseModal={() => setEventFormModal(false)}
        onSubmit={event => saveEvent(event)}
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
              isLoading={screenLoading}
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
              isLoading={screenLoading}
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
              setEvents={setEventsForInfiniteScroll}
              isLoading={screenLoading}
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
              setEvents={setEventsForInfiniteScroll}
              isLoading={screenLoading}
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
              setEvents={setEventsForInfiniteScroll}
              isLoading={screenLoading}
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
