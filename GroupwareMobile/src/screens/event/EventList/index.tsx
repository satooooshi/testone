import React, {useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import AppHeader from '../../../components/Header';
import {EventListProps} from '../../../types/navigator/screenProps/Event';
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

const Tab = createMaterialTopTabNavigator();

const EventList: React.FC<EventListProps> = ({navigation}) => {
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const {data: tags} = useAPIGetTag();
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetEvents>({
    page: '1',
  });
  const {data: events} = useAPIGetEventList(searchQuery);
  const tabs: Tab[] = [
    {
      name: 'All',
      onPress: () => queryRefresh({type: undefined}),
    },
    {
      name: eventTypeNameFactory(EventType.IMPRESSIVE_UNIVERSITY),
      onPress: () => queryRefresh({type: EventType.IMPRESSIVE_UNIVERSITY}),
    },
    {
      name: eventTypeNameFactory(EventType.STUDY_MEETING),
      onPress: () => queryRefresh({type: EventType.STUDY_MEETING}),
    },
    {
      name: eventTypeNameFactory(EventType.BOLDAY),
      onPress: () => queryRefresh({type: EventType.BOLDAY}),
    },
    {
      name: eventTypeNameFactory(EventType.COACH),
      onPress: () => queryRefresh({type: EventType.COACH}),
    },
    {
      name: eventTypeNameFactory(EventType.CLUB),
      onPress: () => queryRefresh({type: EventType.CLUB}),
    },
    {
      name: eventTypeNameFactory(EventType.SUBMISSION_ETC),
      onPress: () => queryRefresh({type: EventType.SUBMISSION_ETC}),
    },
  ];

  const queryRefresh = (
    query: Partial<SearchQueryToGetEvents>,
    selectedTags?: AllTag[],
  ) => {
    const selectedTagIDs = selectedTags?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');

    setSearchQuery({...query, tag: tagQuery || ''});
  };

  return (
    <WholeContainer>
      <AppHeader
        title="Events"
        tabs={tabs}
        activeTabName={
          searchQuery.type ? eventTypeNameFactory(searchQuery.type) : 'All'
        }
      />
      <SearchFormOpenerButton onPress={() => setVisibleSearchFormModal(true)} />
      <SearchForm
        isVisible={visibleSearchFormModal}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        tags={tags || []}
        onSubmit={values =>
          queryRefresh({word: values.word}, values.selectedTags)
        }
      />
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
        }}>
        <Tab.Screen
          name="PersonalCalendar"
          children={() => <EventCalendar personal={true} />}
          options={{title: 'カレンダー(個人)'}}
        />
        <Tab.Screen
          name="EventCalendar"
          component={EventCalendar}
          options={{title: 'カレンダー'}}
        />
        <Tab.Screen
          name="FutureEvents"
          children={() => (
            <EventCardList
              searchResult={events}
              status="future"
              navigation={navigation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: '今後のイベント'}}
        />
        <Tab.Screen
          name="PastEvents"
          children={() => (
            <EventCardList
              searchResult={events}
              status="past"
              navigation={navigation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: '過去のイベント'}}
        />
        <Tab.Screen
          name="CurrentEvents"
          children={() => (
            <EventCardList
              searchResult={events}
              status="current"
              navigation={navigation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: '現在のイベント'}}
        />
      </Tab.Navigator>
    </WholeContainer>
  );
};

export default EventList;
