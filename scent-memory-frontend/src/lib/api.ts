import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait and try again.');
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/auth/register', data),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  
  getMe: () => api.get('/auth/me'),
};

export const memoriesApi = {
  upload: (formData: FormData) =>
    api.post('/memories/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  list: () => api.get('/memories/'),
  
  get: (id: string) => api.get(`/memories/${id}`),
};


export const queryApi = {
  search: (query: string) =>
    api.post('/query/search', { query }),
  
  feedback: (queryId: string, feedback: { rating: number; feedback_text?: string; disliked_notes?: string[] }) =>
    api.post(`/query/${queryId}/feedback`, feedback),
};

export const profileApi = {
  get: () => api.get('/profile/me'),
  
  update: (data: { 
    intensity_preference?: string; 
    budget_range?: string; 
    disliked_notes?: string[];
    top_notes?: string[];
    heart_notes?: string[];
    base_notes?: string[];
    preferred_families?: string[];
    emotional_preferences?: string[];
  }) => api.put('/profile/me', data),
  
  stats: () => api.get('/profile/stats'),
};

export const musicApi = {
  link: (data: { memory_id: string; artist_name: string; track_name: string; spotify_url?: string }) =>
    api.post('/v1/music/link', data),
  
  getForMemory: (memoryId: string) => api.get(`/v1/music/memory/${memoryId}`),
};



