import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Home from '../../screens/Home';
import {StyleSheet} from 'react-native';
import EventList from '../../screens/event/EventList';
// import Wiki from '../../screens/wiki';
import {RootStackParamList} from '../../types/navigator/RootStackParamList';

const BottomTab = () => {
  const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

  return (
    <Tab.Navigator
      activeColor="#000"
      inactiveColor="#808080"
      barStyle={styles.tabBar}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="EventList"
        component={EventList}
        options={{
          tabBarLabel: 'イベント',
          tabBarIcon: ({color}) => (
            <MaterialIcons name="event" color={color} size={26} />
          ),
        }}
      />
      {/* <Tab.Screen */}
      {/*   name="Wiki" */}
      {/*   component={Wiki} */}
      {/*   options={{ */}
      {/*     tabBarLabel: '社内Wiki', */}
      {/*     tabBarIcon: ({color}) => ( */}
      {/*       <Ionicons name="globe-outline" color={color} size={26} /> */}
      {/*     ), */}
      {/*   }} */}
      {/* /> */}
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#EEE',
  },
});

export default BottomTab;
