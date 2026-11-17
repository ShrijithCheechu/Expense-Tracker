const BASE_URL = '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  setTokens(access, refresh) {
    this.token = access;
    localStorage.setItem('access_token', access);
    if (refresh) {
      this.refreshToken = refresh;
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = options.headers || {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(url, { ...options, headers });

    // Handle token refresh if 401
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`;
        response = await fetch(url, { ...options, headers });
      } else {
        this.clearTokens();
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }
      const err = new Error(errorData.detail || errorData.error || JSON.stringify(errorData));
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    // Check if CSV or blob
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      return response.blob();
    }

    return response.json();
  }

  async tryRefreshToken() {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        this.setTokens(data.access, this.refreshToken);
        return true;
      }
    } catch {
      // Refresh failed
    }
    return false;
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(data.access, data.refresh);
    const profile = await this.getProfile();
    localStorage.setItem('user_info', JSON.stringify(profile));
    return { tokens: data, user: profile };
  }

  async register(name, email, password) {
    const data = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setTokens(data.access, data.refresh);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  }

  async demoLogin() {
    const data = await this.request('/auth/demo-login/', {
      method: 'POST',
    });
    this.setTokens(data.access, data.refresh);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Dashboard
  async getDashboardSummary(period = 'weekly', date = '') {
    const params = new URLSearchParams({ period });
    if (date) params.append('date', date);
    return this.request(`/dashboard/summary/?${params.toString()}`);
  }

  // Transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions/?${query}`);
  }

  async createTransaction(txnData) {
    let body;
    if (txnData instanceof FormData) {
      body = txnData;
    } else {
      body = JSON.stringify(txnData);
    }
    return this.request('/transactions/', {
      method: 'POST',
      body,
    });
  }

  async updateTransaction(id, txnData) {
    let body;
    if (txnData instanceof FormData) {
      body = txnData;
    } else {
      body = JSON.stringify(txnData);
    }
    return this.request(`/transactions/${id}/`, {
      method: 'PATCH',
      body,
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}/`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories/');
  }

  async createCategory(catData) {
    return this.request('/categories/', {
      method: 'POST',
      body: JSON.stringify(catData),
    });
  }

  async deleteCategory(id, reassignToId = null) {
    return this.request(`/categories/${id}/`, {
      method: 'DELETE',
      body: JSON.stringify({ reassign_to: reassignToId }),
    });
  }

  // Accounts
  async getAccounts() {
    return this.request('/accounts/');
  }

  async createAccount(accData) {
    return this.request('/accounts/', {
      method: 'POST',
      body: JSON.stringify(accData),
    });
  }

  async updateAccount(id, accData) {
    return this.request(`/accounts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(accData),
    });
  }

  async deleteAccount(id) {
    return this.request(`/accounts/${id}/`, {
      method: 'DELETE',
    });
  }

  async transfer(transferData) {
    return this.request('/accounts/transfer/', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  // Petty Expenses
  async getPettyExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/petty-expenses/?${query}`);
  }

  async createPettyExpense(pettyData) {
    let body;
    if (pettyData instanceof FormData) {
      body = pettyData;
    } else {
      body = JSON.stringify(pettyData);
    }
    return this.request('/petty-expenses/', {
      method: 'POST',
      body,
    });
  }

  async updatePettyExpense(id, pettyData) {
    let body;
    if (pettyData instanceof FormData) {
      body = pettyData;
    } else {
      body = JSON.stringify(pettyData);
    }
    return this.request(`/petty-expenses/${id}/`, {
      method: 'PATCH',
      body,
    });
  }

  async deletePettyExpense(id) {
    return this.request(`/petty-expenses/${id}/`, {
      method: 'DELETE',
    });
  }

  async getPettySummary(month = '') {
    const query = month ? `?month=${month}` : '';
    return this.request(`/petty-expenses/summary/${query}`);
  }

  async updatePettyBudget(amount, month = '') {
    return this.request('/petty-expenses/budget/', {
      method: 'POST',
      body: JSON.stringify({ amount, month }),
    });
  }

  async exportPettyCsv() {
    return this.request('/petty-expenses/export/');
  }

  // Balance
  async getBalanceSummary(period = 'monthly') {
    return this.request(`/balance/summary/?period=${period}`);
  }

  async getBalanceTrend(period = 'monthly') {
    return this.request(`/balance/trend/?period=${period}`);
  }

  async getBalanceHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/balance/history/?${query}`);
  }

  async exportBalanceCsv() {
    return this.request('/balance/export/');
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications/');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read/', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
