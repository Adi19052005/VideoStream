const API_BASE_URL = window.__CONFIG__?.API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  setToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getHeaders(includeAuth = true, isJSON = true) {
    const token = this.getToken();
    const headers = {};

    if (isJSON) {
      headers['Content-Type'] = 'application/json';
    }

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async handleResponse(response) {
    let data;

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  }

  async register(email, password, username) {
    const response = await fetch(`${this.baseURL}/users/signup`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password, username })
    });

    const data = await this.handleResponse(response);
    if (data.token) this.setToken(data.token);

    return data;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/users/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password })
    });

    const data = await this.handleResponse(response);
    if (data.token) this.setToken(data.token);

    return data;
  }

  async logout() {
    this.setToken(null);
  }

  async getVideos(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString();

    const response = await fetch(`${this.baseURL}/videos?${query}`, {
      headers: this.getHeaders(false)
    });

    return this.handleResponse(response);
  }

  async uploadVideo(formData) {
    const token = this.getToken();

    const response = await fetch(`${this.baseURL}/videos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    return this.handleResponse(response);
  }

  async getVideoById(videoId) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}`, {
      headers: this.getHeaders(false)
    });

    return this.handleResponse(response);
  }

  async getVideoStream(videoId) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}/stream`, {
      headers: this.getHeaders(false)
    });

    return this.handleResponse(response);
  }

  async likeVideo(videoId) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}/like`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async addComment(videoId, text) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text })
    });

    return this.handleResponse(response);
  }

  async editComment(videoId, commentId, text) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}/comments/${commentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ text })
    });

    return this.handleResponse(response);
  }

  async deleteComment(videoId, commentId) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async deleteVideo(videoId) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async updateVideo(videoId, data) {
    const response = await fetch(`${this.baseURL}/videos/${videoId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  async getUserProfile(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      headers: this.getHeaders(false)
    });

    return this.handleResponse(response);
  }

  async followUser(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}/follow`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async unfollowUser(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}/unfollow`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async toggleFollow(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}/toggle-follow`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async search(q) {
    const response = await fetch(`${this.baseURL}/videos/search?q=${encodeURIComponent(q)}`, {
      headers: this.getHeaders(false)
    });

    return this.handleResponse(response);
  }

  async getMe() {
    const response = await fetch(`${this.baseURL}/users/me`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async updateMyProfile(data) {
    const response = await fetch(`${this.baseURL}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }
}

export default new ApiService();
