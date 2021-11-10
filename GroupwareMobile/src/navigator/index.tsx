import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Login from '../screens/auth/Login';
import {useAuthenticate} from '../contexts/useAuthenticate';
import {RootStackParamList} from '../types/navigator/RootStackParamList';
import DrawerTab from './Drawer';
import AccountDetail from '../screens/account/AccountDetail';
import Profile from '../screens/account/Profile';
import UpdatePassword from '../screens/account/UpdatePassword';
import EventDetail from '../screens/event/EventDetail';
import WikiDetail from '../screens/wiki/WikiDetail';
import UserRegisteringAdmin from '../screens/admin/UserRegisteringAdmin';

const Stack = createStackNavigator<RootStackParamList>();

const Navigator = () => {
  const {user} = useAuthenticate();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user?.id ? 'Main' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Main"
          component={DrawerTab}
          options={{headerShown: false}}
        />
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
        <Stack.Screen
          name="EventDetail"
          component={EventDetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="WikiDetail"
          component={WikiDetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UserRegisteringAdmin"
          component={UserRegisteringAdmin}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
