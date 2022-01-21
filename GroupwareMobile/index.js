/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import 'intl';
import 'intl/locale-data/jsonp/ja';
import messaging from '@react-native-firebase/messaging';

AppRegistry.registerComponent(appName, () => App);
