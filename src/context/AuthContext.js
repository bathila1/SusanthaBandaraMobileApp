import React, {createContext, useState, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);

  const login = async (userData, accessToken, refreshToken) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    if (accessToken) await AsyncStorage.setItem('access_token', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refresh_token', refreshToken);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.multiRemove(['user', 'access_token', 'refresh_token']);
  };

  const loadUser = async () => {
    const stored = await AsyncStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  };

  return (
    <AuthContext.Provider value={{user, login, logout, loadUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);