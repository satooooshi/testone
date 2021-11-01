import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Home from '../../screens/Home';
import {darkFontColor} from '../../utils/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Wiki from '../../screens/wiki';
import EventList from '../../screens/event/EventList';
import EventDetail from '../../screens/event/EventDetail';
import WikiDetail from '../../screens/wiki/WikiDetail';
import WikiList from '../../screens/wiki/WikiList';
import {createStackNavigator} from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const WikiStack = () => (
  <Stack.Navigator initialRouteName="WikiList">
    <Stack.Screen name="Wiki" component={Wiki} options={{headerShown: false}} />
    <Stack.Screen
      name="WikiDetail"
      component={WikiDetail}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="WikiList"
      component={WikiList}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const EventStack = () => (
  <Stack.Navigator initialRouteName="EventList">
    <Stack.Screen
      name="EventList"
      component={EventList}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EventDetail"
      component={EventDetail}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const DrawerTab = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: darkFontColor,
          width: 240,
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerLabel: 'ホーム',
          drawerIcon: ({color}) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Drawer.Screen
        name="EventDrawer"
        component={EventStack}
        options={{
          drawerLabel: 'イベント',
          drawerIcon: ({color}) => (
            <MaterialIcons name="event" color={color} size={26} />
          ),
        }}
      />
      <Drawer.Screen
        name="WikiDrawer"
        component={WikiStack}
        options={{
          drawerLabel: '社内Wiki',
          drawerIcon: ({color}) => (
            <Ionicons name="globe-outline" color={color} size={26} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
export default DrawerTab;
