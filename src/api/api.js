import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://susanthabandara.com/api';
const API_KEY = 'sb_app_2026_X9k3pQ7mN4vR8tL'; // must match config.php

// Get access token from storage
const getToken = async () => await AsyncStorage.getItem('access_token');

// Refresh access token using refresh token
const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/refresh.php`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Api-Key': API_KEY},
      body: JSON.stringify({refresh_token: refreshToken}),
    });
    const data = await res.json();
    if (data.success) {
      await AsyncStorage.setItem('access_token', data.access_token);
      return data.access_token;
    }
  } catch (e) {}
  return null;
};

// Auth-protected fetch wrapper
const authFetch = async (url, options = {}) => {
  let token = await getToken();
  const headers = {
    'X-Api-Key': API_KEY,
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {}),
  };

  let res = await fetch(url, {...options, headers});

  // If token expired, refresh and retry once
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      res = await fetch(url, {...options, headers});
    }
  }

  return res;
};

// === Public endpoints (no auth needed) ===

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Api-Key': API_KEY},
    body: JSON.stringify({email, password}),
  });
  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/register.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Api-Key': API_KEY},
    body: JSON.stringify(data),
  });
  return res.json();
};

// === Protected endpoints (need auth) ===

export const getClasses = async (user_id, grade, month, year) => {
  const res = await authFetch(
    `${BASE_URL}/classes.php?user_id=${user_id}&grade=${grade}&month=${month}&year=${year}`
  );
  return res.json();
};

export const submitPayslip = async (formData) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/submit.php`, {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return res.json();
};

export const selectClass = async (user_id, meeting_id) => {
  const res = await authFetch(`${BASE_URL}/select.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({user_id, meeting_id}),
  });
  return res.json();
};

export const getClassStatus = async (user_id, meeting_id) => {
  const res = await authFetch(
    `${BASE_URL}/class_status.php?user_id=${user_id}&meeting_id=${meeting_id}`
  );
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await authFetch(`${BASE_URL}/profile.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getVod = async (user_id, meeting_id) => {
  try {
    const res = await authFetch(`${BASE_URL}/vod.php?user_id=${user_id}&meeting_id=${meeting_id}`);
    return JSON.parse(await res.text());
  } catch (e) {
    return {success: false, message: 'Server error'};
  }
};

export const useChance = async (user_id, meeting_id) => {
  try {
    const res = await authFetch(`${BASE_URL}/use_chance.php`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({user_id, meeting_id}),
    });
    return JSON.parse(await res.text());
  } catch (e) {
    return {success: false, message: 'Server error'};
  }
};

export const getZoomLink = async (user_id, meeting_id) => {
  const res = await authFetch(`${BASE_URL}/zoom_link.php?user_id=${user_id}&meeting_id=${meeting_id}`);
  return res.json();
};