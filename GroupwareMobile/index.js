/**
 * @format
 */
import React from 'react';
import {AppRegistry, Platform} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import 'intl';
import 'intl/locale-data/jsonp/ja';
import messaging from '@react-native-firebase/messaging';
import AppFake from './src/AppFake';

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
// });

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    console.log('Headless');
    return <AppFake />;
    /* Notice this component, it is not the App Component but a different one*/
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);

// AppRegistry.registerComponent(appName, () => App);
