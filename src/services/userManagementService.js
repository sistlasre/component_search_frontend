import axios from 'axios';

// Base API URL - update this with your actual API Gateway URL
//const API_BASE_URL = 'https://e1hygwwcle.execute-api.us-west-2.amazonaws.com/dev';
const API_BASE_URL = '/api';

// Session id lives in localStorage so it survives reloads. Generated lazily
// on first access. Kept stable across logins/logouts (we rotate only on
// explicit reset) so anonymous activity can be merged on login.
export const SESSION_ID_STORAGE_KEY = 'cs_session_id';

const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const getOrCreateSessionId = () => {
  try {
    let id = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (!id) {
      id = generateSessionId();
      localStorage.setItem(SESSION_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    // SSR / private-mode fallback
    return generateSessionId();
  }
};

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and session header
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

        // Always attach the session id so cart/order endpoints can resolve
        // an anonymous cart owner when no bearer token is present.
        try {
          const sessionId = getOrCreateSessionId();
          if (sessionId) {
            config.headers['X-Session-Id'] = sessionId;
          }
        } catch {
          /* ignore */
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

  async getUser() {
    return this.api.get('/user');
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

  // -------------------- Contact Us --------------------
  async submitContactForm(payload) {
    // payload: { name, email, message, company?, phone?, subject?, source? }
    return this.api.post('/contact', payload);
  }

  // -------------------- Session --------------------
  async ensureSession() {
    const session_id = getOrCreateSessionId();
    return this.api.post('/session', { session_id });
  }

  // -------------------- Cart --------------------
  async getCart() {
    return this.api.get('/cart');
  }

  async putCart(items) {
    return this.api.put('/cart', { items });
  }

  async addCartItem(item) {
    return this.api.post('/cart/items', item);
  }

  async updateCartItem(partNumber, quantity) {
    return this.api.patch(`/cart/items/${encodeURIComponent(partNumber)}`, { quantity });
  }

  async removeCartItem(partNumber) {
    return this.api.delete(`/cart/items/${encodeURIComponent(partNumber)}`);
  }

  async clearRemoteCart() {
    return this.api.delete('/cart');
  }

  async mergeCart(sessionId) {
    return this.api.post('/cart/merge', { session_id: sessionId });
  }

  // -------------------- Orders & Requests --------------------
  async createOrder({ recordType = 'order', contact, items, notes, purchaseOrder }) {
    return this.api.post('/orders', {
      record_type: recordType,
      contact,
      items,
      notes,
      purchase_order: purchaseOrder,
    });
  }

  async getMyOrders(params = {}) {
    return this.api.get('/orders', { params });
  }

  async getOrder(recordId) {
    return this.api.get(`/orders/${encodeURIComponent(recordId)}`);
  }

  // -------------------- Purchase Order PDF --------------------
  async getPurchaseOrderUploadUrl({ filename } = {}) {
    return this.api.post('/orders/purchase-order-url', {
      filename,
      content_type: 'application/pdf',
    });
  }

  async getPurchaseOrderDownloadUrl(recordId) {
    return this.api.get(`/orders/${encodeURIComponent(recordId)}/purchase-order`);
  }

  /**
   * Convenience: obtain a presigned URL, PUT the file to S3, and return the
   * `purchase_order` payload to attach to an order.
   */
  async uploadPurchaseOrderPdf(file) {
    if (!file) throw new Error('File is required');
    if (file.type !== 'application/pdf') {
      throw new Error('Purchase order must be a PDF');
    }
    const { data } = await this.getPurchaseOrderUploadUrl({ filename: file.name });
    await axios.put(data.presigned_url, file, {
      headers: { 'Content-Type': 'application/pdf' },
    });
    return {
      key: data.upload_key,
      bucket: data.bucket,
      filename: file.name,
    };
  }
}

export const apiService = new ApiService();
