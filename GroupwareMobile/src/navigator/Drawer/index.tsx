import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
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
import PostWiki from '../../screens/wiki/PostWiki';
import Home from '../../screens/Home';
import {Icon} from 'react-native-magnus';
import AccountDetail from '../../screens/account/AccountDetail';
import Profile from '../../screens/account/Profile';
import UpdatePassword from '../../screens/account/UpdatePassword';
import UserList from '../../screens/UserList';
import UserAdmin from '../../screens/admin/UserAdmin';
import UserRegisteringAdmin from '../../screens/admin/UserRegisteringAdmin';

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
    <Stack.Screen
      name="PostWiki"
      component={PostWiki}
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

const AccountStack = () => (
  <Stack.Navigator initialRouteName="AccountDetail">
    <Stack.Screen
      name="AccountDetail"
      component={AccountDetail}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Profile"
      component={Profile}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="UpdatePassword"
      component={UpdatePassword}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const UserListStack = () => (
  <Stack.Navigator initialRouteName="UserList">
    <Stack.Screen
      name="UserList"
      component={UserList}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AccountDetail"
      component={AccountDetail}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator initialRouteName="UserAdmin">
    <Stack.Screen
      name="UserAdmin"
      component={UserAdmin}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AccountDetail"
      component={AccountDetail}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="UserRegisteringAdmin"
      component={UserRegisteringAdmin}
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
        drawerLabelStyle: {color: 'white'},
        drawerActiveTintColor: 'green400',
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
      <Drawer.Screen
        name="Users"
        component={UserListStack}
        options={{
          drawerLabel: '社員名鑑',
          drawerIcon: ({color}) => (
            <Icon
              name="users"
              fontFamily="FontAwesome5"
              color={color}
              fontSize={21}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Account"
        component={AccountStack}
        options={{
          drawerLabel: 'アカウント',
          drawerIcon: ({color}) => (
            <Icon
              name="user-alt"
              fontFamily="FontAwesome5"
              color={color}
              fontSize={26}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Admin"
        component={AdminStack}
        options={{
          drawerLabel: '管理',
          drawerIcon: ({color}) => (
            <Icon
              name="user-alt"
              fontFamily="FontAwesome5"
              color={color}
              fontSize={26}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
export default DrawerTab;
