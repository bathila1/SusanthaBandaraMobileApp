import {Linking, Alert} from 'react-native';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const CURRENT_VERSION = 1; // increment this with each release

const checkForceUpdate = async () => {
  try {
    const res = await fetch('https://susanthabandara.com/api/version.php');
    const data = await res.json();
    if (data.force_update && data.min_version > CURRENT_VERSION) {
      Alert.alert(
        'Update Required',
        'Please update the app to continue.' + '\n\n' + 'Message from developer: ' + data.message,
        [{
          text: 'Update Now',
          onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.susanthabandara'),
        }],
        {cancelable: false}
      );
    }
  } catch (e) {}
};

const Root = () => {
  const {loadUser, user} = useAuth();

useEffect(() => {
  loadUser();
  checkForceUpdate();
}, []);
  

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}