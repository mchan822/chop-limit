/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React from 'react';
 import { Provider } from 'react-redux';
 import { PersistGate } from 'redux-persist/integration/react';
 import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
 import { Platform } from 'react-native';
 import AppContainer from './src/router';
 import { Loading } from './src/components';
 import { NavigationService } from './src/core/services';
 import store from './src/store';
 import firebase from '@react-native-firebase/app';
 import { Settings } from 'react-native-fbsdk-next';
 import Text from 'react-native'
 
 // Ask for consent first if necessary
 // Possibly only do this for iOS if no need to handle a GDPR-type flow
 Settings.initializeSDK();
 var firebaseConfig = {
  apiKey: "AIzaSyA0t1b5Tt76tm61UPEjFOn6BSaIM20Emvg",
  authDomain: "chowlocal.firebaseapp.com",
  databaseURL: "https://chowlocal.firebaseio.com",
  projectId: "chowlocal",
  storageBucket: "chowlocal.appspot.com",
  messagingSenderId: "136006348676",
  appId: "1:136006348676:ios:0800f2c9ad28066f0b77d1",
}

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

 MaterialIcon.loadFont();
 Platform.OS == 'ios' ? firebase.initializeApp(firebaseConfig) : firebase.initializeApp();
 const App = () => {
   return (
     <Provider store={store.store}>
       <PersistGate loading={<Loading />} persistor={store.persistor}>
         <AppContainer
           ref={(navigatorRef) => {
             NavigationService.setNavigator(navigatorRef);
           }}
         />
       </PersistGate>
     </Provider>
   );
 };
 
 export default App;
 