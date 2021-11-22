import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Login from '../screens/auth/Login';
import {useAuthenticate} from '../contexts/useAuthenticate';
import {RootStackParamList} from '../types/navigator/RootStackParamList';
import DrawerTab from './Drawer';
import {tokenString} from '../utils/url';

const Stack = createStackNavigator<RootStackParamList>();

const Navigator = () => {
  const {user} = useAuthenticate();
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user?.id || tokenString() ? 'Main' : 'Login'}>
        {user?.id || tokenString() ? (
          <>
            <Stack.Screen
              name="Main"
              component={DrawerTab}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
