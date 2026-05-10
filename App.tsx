import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const Root = () => {
  const {loadUser} = useAuth();

  useEffect(() => {
    loadUser();
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