import React from 'react';
import WholeContainer from '../../../components/WholeContainer';
import AppHeader from '../../../components/Header';
import {EventListProps} from '../../../types/navigator/screenProps/Event';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import EventCalendar from './EventCalendar';
import EventCardList from './EventCardList';

const Tab = createMaterialTopTabNavigator();

const EventList: React.FC<EventListProps> = ({navigation}) => {
  return (
    <WholeContainer>
      <AppHeader title="Events" activeTabName="All" />
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
            <EventCardList type="future" navigation={navigation} />
          )}
          options={{title: '今後のイベント'}}
        />
        <Tab.Screen
          name="PastEvents"
          children={() => <EventCardList type="past" navigation={navigation} />}
          options={{title: '今後のイベント'}}
        />
        <Tab.Screen
          name="CurrentEvents"
          children={() => (
            <EventCardList type="current" navigation={navigation} />
          )}
          options={{title: '現在のイベント'}}
        />
      </Tab.Navigator>
    </WholeContainer>
  );
};

export default EventList;
