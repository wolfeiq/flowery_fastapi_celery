import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;


export interface NoteCount {
  note: string;
  count: number;
}

export interface Profile {
  intensity_preference?: string;
  budget_range?: string;
  disliked_notes?: string[];
  top_notes?: NoteCount[];       
  heart_notes?: NoteCount[];     
  base_notes?: NoteCount[];      
  preferred_families?: string[];
  emotional_preferences?: string[];
}

export interface ProfileStats {
  total_memories: number;
  total_queries: number;
}

export interface UpdateProfileRequest {
  intensity_preference?: string;
  budget_range?: string;
  disliked_notes?: string[];
  top_notes?: NoteCount[];    
  heart_notes?: NoteCount[];     
  base_notes?: NoteCount[];      
  preferred_families?: string[];
  emotional_preferences?: string[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface ApiErrorResponse {
  detail?: string | { message: string; error: string; reset_at?: string };
}

export interface RateLimitError {
  message: string;
  error: string;
  reset_at?: string;
}


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
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 429) {
      const detail = error.response.data?.detail;
      
      if (detail && typeof detail === 'object') {
        const rateLimitError = detail as RateLimitError;
        toast.error(rateLimitError.message || rateLimitError.error, {
          duration: 5000,
          icon: '⏱️',
        });
        
        if (rateLimitError.reset_at) {
          const resetTime = new Date(rateLimitError.reset_at).toLocaleTimeString();
          toast(`Limit resets at ${resetTime}`, { duration: 3000 });
        }
      } else if (typeof detail === 'string') {
        toast.error(detail, {
          duration: 5000,
          icon: '⏱️',
        });
      } else {
        toast.error('Too many requests. Please wait and try again.', {
          duration: 5000,
          icon: '⏱️',
        });
      }
    } else if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: RegisterRequest): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/register', data).then(res => res.data),
  
  login: (email: string, password: string): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(res => {
      return res.data;
    }),
  
  getMe: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/me');

      if (!response.data) {
        throw new Error('No user data in response');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};


export const memoriesApi = {
  upload: (formData: FormData): Promise<Memory> =>
    api.post<Memory>('/memories/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),
  
  list: (): Promise<Memory[]> => 
    api.get<Memory[]>('/memories/').then(res => res.data),
  
  get: (id: string): Promise<Memory> => 
    api.get<Memory>(`/memories/${id}`).then(res => res.data),
};


export interface SearchResult {
  query_id: string;
  response: string; 
  results: any[]; 
}

export interface FeedbackRequest {
  rating: number;
  feedback_text?: string;
  disliked_notes?: string[];
}

export const queryApi = {
  search: (query: string): Promise<SearchResult> =>
    api.post<SearchResult>('/query/search', { query }).then(res => res.data),
  
  feedback: (queryId: string, feedback: FeedbackRequest): Promise<void> =>
    api.post(`/query/${queryId}/feedback`, feedback).then(res => res.data),
};


export const profileApi = {
  get: (): Promise<Profile> => 
    api.get<Profile>('/profile/me').then(res => res.data),
  
  update: (data: UpdateProfileRequest): Promise<Profile> => 
    api.put<Profile>('/profile/me', data).then(res => res.data),
  
  stats: (): Promise<ProfileStats> => 
    api.get<ProfileStats>('/profile/stats').then(res => res.data),
};

export interface MusicLink {
  memory_id: string;
  artist_name: string;
  track_name: string;
  spotify_url?: string;
}

export const musicApi = {
  link: (data: MusicLink): Promise<any> =>
    api.post('/v1/music/link', data).then(res => res.data),
  
  getForMemory: (memoryId: string): Promise<any> => 
    api.get(`/v1/music/memory/${memoryId}`).then(res => res.data),
};

export interface ExtractedScent {
  scent_name: string;
  brand?: string;
  scent_family?: string;
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  color?: string;
  emotion?: string;
  confidence: number;
}

export interface Memory {
  id: string;
  title: string;             
  content?: string;
  occasion: string;
  memory_type: string;
  emotion?: string;
  processed: boolean;
  created_at: string;
  file_path?: string;
  file_type?: string;
  extracted_scents?: ExtractedScent[];
}