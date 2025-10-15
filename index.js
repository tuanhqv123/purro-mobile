/**
 * @format
 */

// Polyfill for crypto.getRandomValues (MUST be first)
import 'react-native-get-random-values';

// Import gesture handler (MUST be before any component that uses gestures)
import 'react-native-gesture-handler';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
