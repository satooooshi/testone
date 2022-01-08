import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import {useEventCardListSearchQuery} from '../../../contexts/event/useEventSearchQuery';
import {EventType} from '../../../types';
import {EventListRouteProps} from '../../../types/navigator/drawerScreenProps';
import {eventTypeColorFactory} from '../../../utils/factory/eventTypeColorFactory';
import eventTypeNameFactory from '../../../utils/factory/eventTypeNameFactory';
import EventCalendar from './EventCalendar';
import EventCardList from './EventCardList';

const TopTab = createMaterialTopTabNavigator();

const EventSearcher: React.FC = () => {
  const typePassedByRoute = useRoute<EventListRouteProps>()?.params?.type;
  const tagPassedByRoute = useRoute<EventListRouteProps>()?.params?.tag;
  const personalPassedByRoute =
    useRoute<EventListRouteProps>()?.params?.personal;
  const {partOfSearchQuery, setPartOfSearchQuery} =
    useEventCardListSearchQuery();
  const [visibleEventFormModal, setEventFormModal] = useState(false);
  const tabs: Tab[] = [
    {
      name: 'All',
      onPress: () => setPartOfSearchQuery({type: undefined}),
    },
    {
      name: eventTypeNameFactory(EventType.IMPRESSIVE_UNIVERSITY),
      onPress: () =>
        setPartOfSearchQuery({type: EventType.IMPRESSIVE_UNIVERSITY}),
      borderBottomColor: eventTypeColorFactory(EventType.IMPRESSIVE_UNIVERSITY),
    },
    {
      name: eventTypeNameFactory(EventType.STUDY_MEETING),
      onPress: () => setPartOfSearchQuery({type: EventType.STUDY_MEETING}),
      borderBottomColor: eventTypeColorFactory(EventType.STUDY_MEETING),
    },
    {
      name: eventTypeNameFactory(EventType.BOLDAY),
      onPress: () => setPartOfSearchQuery({type: EventType.BOLDAY}),
      borderBottomColor: eventTypeColorFactory(EventType.BOLDAY),
    },
    {
      name: eventTypeNameFactory(EventType.COACH),
      onPress: () => setPartOfSearchQuery({type: EventType.COACH}),
      borderBottomColor: eventTypeColorFactory(EventType.COACH),
    },
    {
      name: eventTypeNameFactory(EventType.CLUB),
      onPress: () => setPartOfSearchQuery({type: EventType.CLUB}),
      borderBottomColor: eventTypeColorFactory(EventType.CLUB),
    },
    {
      name: eventTypeNameFactory(EventType.SUBMISSION_ETC),
      onPress: () => setPartOfSearchQuery({type: EventType.SUBMISSION_ETC}),
      borderBottomColor: eventTypeColorFactory(EventType.SUBMISSION_ETC),
    },
  ];

  useEffect(() => {
    if (typePassedByRoute && typePassedByRoute !== partOfSearchQuery.type) {
      setPartOfSearchQuery({type: typePassedByRoute});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typePassedByRoute]);

  useEffect(() => {
    if (tagPassedByRoute && tagPassedByRoute !== partOfSearchQuery.tag) {
      setPartOfSearchQuery({tag: tagPassedByRoute});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagPassedByRoute]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="Events"
        tabs={tabs}
        activeTabName={
          partOfSearchQuery.type
            ? eventTypeNameFactory(partOfSearchQuery.type)
            : 'All'
        }
        rightButtonName={'新規イベント'}
        onPressRightButton={() => setEventFormModal(true)}
      />
      <TopTab.Navigator
        initialRouteName={
          personalPassedByRoute ? 'PersonalCalendar' : 'EventCalendar'
        }
        screenOptions={{
          tabBarScrollEnabled: true,
        }}>
        <TopTab.Screen
          name="PersonalCalendar"
          children={() => (
            <EventCalendar
              visibleEventFormModal={visibleEventFormModal}
              hideEventFormModal={() => setEventFormModal(false)}
              personal={true}
            />
          )}
          options={{title: 'Myスケジュール'}}
        />
        <TopTab.Screen
          name="EventCalendar"
          children={() => (
            <EventCalendar
              visibleEventFormModal={visibleEventFormModal}
              hideEventFormModal={() => setEventFormModal(false)}
            />
          )}
          options={{title: '全体カレンダー'}}
        />
        <TopTab.Screen
          name="FutureEvents"
          children={() => (
            <EventCardList
              visibleEventFormModal={visibleEventFormModal}
              hideEventFormModal={() => setEventFormModal(false)}
              status="future"
            />
          )}
          options={{title: '今後のイベント'}}
        />
        <TopTab.Screen
          name="PastEvents"
          children={() => (
            <EventCardList
              visibleEventFormModal={visibleEventFormModal}
              hideEventFormModal={() => setEventFormModal(false)}
              status="past"
            />
          )}
          options={{title: '過去のイベント'}}
        />
        <TopTab.Screen
          name="CurrentEvents"
          children={() => (
            <EventCardList
              visibleEventFormModal={visibleEventFormModal}
              hideEventFormModal={() => setEventFormModal(false)}
              status="current"
            />
          )}
          options={{title: '現在のイベント'}}
        />
      </TopTab.Navigator>
    </WholeContainer>
  );
};

export default EventSearcher;
