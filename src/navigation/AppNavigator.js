import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuth} from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const {user} = useAuth();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
          <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}