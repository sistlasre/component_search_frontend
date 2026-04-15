import axios from 'axios';

// Base API URL - update this with your actual API Gateway URL
const API_BASE_URL = 'https://e1hygwwcle.execute-api.us-west-2.amazonaws.com/dev';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Skip authorization header when on the register page
        const isOnRegisterPage = window.location.pathname === '/register';

        // Only add token if we're not on the register page
        if (!isOnRegisterPage) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          // Remove the Authorization header if it already exists
          if (config.headers.Authorization) {
            delete config.headers.Authorization;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Authentication endpoints
  async login(username, password) {
    return this.api.post('/user/signin', { username, password });
  }

  async register(username, password, email='', firstName='', lastName='', parent_user_id='', affiliate_id='') {
    return this.api.post('/user', {
      username,
      password,
      email,
      firstName,
      lastName,
      parent_user_id,
      affiliate_id
    });
  }

  async getUsers(parentUserId = '') {
    const params = parentUserId ? { parentUser: parentUserId } : {};
    return this.api.get('/users', { params });
  }

  async updateUser(userId, userData) {
    return this.api.put(`/user/${userId}`, userData);
  }

  async getUserAccess() {
      return this.api.get('/get_user_access');
  }

  async verifyUser(token) {
    return this.api.post('/verify_account', { token });
  }

  async requestPasswordReset(username) {
    return this.api.post('/reset_password', {
      username,
      requestType: 'request'
    });
  }

  async resetPassword(token, password) {
    return this.api.post('/reset_password', {
      token,
      password,
      requestType: 'update'
    });
  }
}

export const apiService = new ApiService();
