// import axios from 'axios';

// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL,
// });

// API.interceptors.request.use((req) => {
//   if (localStorage.getItem('userInfo')) {
//     req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`;
//   }
//   return req;
// });

// export const login = (formData) => API.post('/api/users/login', formData);
// export const register = (formData) => API.post('/api/users/register', formData);
// export const getCitizenReports = () => API.get('/api/reports/citizen');
// export const submitReport = (reportData) => API.post('/api/reports', reportData);
// export const getLeaderboard = () => API.get('/api/reports/leaderboard');
// export default API;



import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., http://localhost:5000/api
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem('userInfo')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`;
  }
  return req;
});

export const login = (formData) => API.post('/users/login', formData);
export const register = (formData) => API.post('/users/register', formData);
export const getCitizenReports = () => API.get('/reports');
export const submitReport = (reportData) => API.post('/reports', reportData);
export const getLeaderboard = () => API.get('/reports/leaderboard');

export default API;
