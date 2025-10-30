import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://smart-waste-nairobi-chi.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.log('Error setting auth header:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const reportService = {
  submitReport: async (reportData) => {
    try {
      const response = await api.post('/reports/submit', reportData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit report');
    }
  },

  getAllReports: async () => {
    try {
      const response = await api.get('/reports/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  getUserReports: async (userId) => {
    try {
      const response = await api.get(`/reports/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user reports');
    }
  }
};

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  updateUserActivity: async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      console.log('Activity update failed');
    }
  }
};

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback/submit', feedbackData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit feedback');
    }
  },

  getUserFeedback: async (userId) => {
    try {
      const response = await api.get(`/feedback/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user feedback');
    }
  }
};

export default api;