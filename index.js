/**
 * @format
 */

import 'react-native-gesture-handler';

import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import { thunk } from 'redux-thunk';
import reducers from './src/reducers';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

//  console.disableYellowBox = true;
//  console.ignoredYellowBox = ['Warning'];

const store = createStore(reducers, applyMiddleware(thunk, logger));

const ReduxApp = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <App />
      </Provider>
    </GestureHandlerRootView>
  );
};

AppRegistry.registerComponent(appName, () => ReduxApp);
