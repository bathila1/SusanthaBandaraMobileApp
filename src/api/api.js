const BASE_URL = 'https://susanthabandara.com/api';

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password}),
  });
  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/register.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getClasses = async (user_id, grade, month, year) => {
  const res = await fetch(
    `${BASE_URL}/classes.php?user_id=${user_id}&grade=${grade}&month=${month}&year=${year}`
  );
  return res.json();
};

export const submitPayslip = async (formData) => {
  const res = await fetch(`${BASE_URL}/submit.php`, {
    method: 'POST',
    body: formData,
    // NO headers here - React Native sets multipart/form-data automatically
  });
  return res.json();
};

export const selectClass = async (user_id, meeting_id) => {
  const res = await fetch(`${BASE_URL}/select.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({user_id, meeting_id}),
  });
  return res.json();
};

export const getClassStatus = async (user_id, meeting_id) => {
  const res = await fetch(`${BASE_URL}/class_status.php?user_id=${user_id}&meeting_id=${meeting_id}`);
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(`${BASE_URL}/profile.php`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });
  return res.json();
};