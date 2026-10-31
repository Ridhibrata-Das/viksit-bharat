/**
 * Viksit Bengal Dashboard - Unified Test Context
 * Seamlessly adapts test calls between live API server and authoritative contract reference
 */

import { ApiClient } from './api-client.js';
import { MockDispatcher } from './mock-dispatcher.js';
import { ContractChecker } from './contract-checker.js';

export class TestContext {
  constructor(options = {}) {
    this.mode = options.mode || 'auto'; // 'auto', 'live', 'contract'
    this.apiClient = new ApiClient(options.baseUrl);
    this.mockDispatcher = new MockDispatcher();
    this.contractChecker = new ContractChecker();
    this.isLive = false;
    this.token = null;
  }

  async init() {
    if (this.mode === 'live') {
      this.isLive = true;
    } else if (this.mode === 'contract') {
      this.isLive = false;
    } else {
      this.isLive = await this.apiClient.isServerAlive();
    }
    return this;
  }

  setToken(token) {
    this.token = token;
    this.apiClient.setToken(token);
  }

  async login(email, password) {
    if (this.isLive) {
      const res = await this.apiClient.login(email, password);
      if (res.ok && res.data?.accessToken) {
        this.token = res.data.accessToken;
      }
      return res;
    }
    const res = this.mockDispatcher.handleLogin({ email, password });
    if (res.status === 200 && res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async getHealth() {
    if (this.isLive) {
      return this.apiClient.get('/health');
    }
    const res = this.mockDispatcher.handleGetHealth();
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async getMe() {
    if (this.isLive) {
      return this.apiClient.get('/auth/me');
    }
    const authHeader = this.token ? `Bearer ${this.token}` : undefined;
    const res = this.mockDispatcher.handleGetMe(authHeader);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async verifyAuth(body = {}, options = {}) {
    if (this.isLive) {
      const res = await this.apiClient.post('/auth/verify', body, options?.headers);
      return { ok: res.ok, status: res.status, body: res.data, data: res.data };
    }
    const authHeader = options?.headers?.Authorization || options?.headers?.authorization || (this.token ? `Bearer ${this.token}` : undefined);
    const res = this.mockDispatcher.handleVerifyAuth(body, authHeader);
    return { ok: res.status === 200, status: res.status, body: res.data, data: res.data };
  }

  async post(path, body = {}, options = {}) {
    if (path.includes('/auth/verify')) {
      return this.verifyAuth(body, options);
    }
    if (path.includes('/api/social/generate')) {
      const res = this.mockDispatcher.handleSocialGenerate(body);
      return { ok: res.status === 200, status: res.status, body: res.data, data: res.data };
    }
    if (path.includes('/api/social/publish')) {
      const res = await this.mockDispatcher.handleSocialPublish(body);
      return { ok: res.status === 200, status: res.status, body: res.data, data: res.data };
    }
    if (this.isLive) {
      const res = await this.apiClient.post(path, body, options?.headers);
      return { ok: res.ok, status: res.status, body: res.data, data: res.data };
    }
    return { ok: false, status: 404, body: { message: `Route ${path} not mocked` } };
  }

  async getDistricts() {
    if (this.isLive) {
      return this.apiClient.get('/districts');
    }
    const res = this.mockDispatcher.handleGetDistricts();
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async getDistrictByCode(code) {
    if (this.isLive) {
      return this.apiClient.get(`/districts/${encodeURIComponent(code)}`);
    }
    const res = this.mockDispatcher.handleGetDistrictByCode(code);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async getPromises(query = {}) {
    if (this.isLive) {
      const q = new URLSearchParams(query).toString();
      return this.apiClient.get(`/promises${q ? '?' + q : ''}`);
    }
    const res = this.mockDispatcher.handleGetPromises(query);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async getPromiseByCode(code) {
    if (this.isLive) {
      return this.apiClient.get(`/promises/${encodeURIComponent(code)}`);
    }
    const res = this.mockDispatcher.handleGetPromiseByCode(code);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async createPromise(dto) {
    if (this.isLive) {
      return this.apiClient.post('/promises', dto);
    }
    const authHeader = this.token ? `Bearer ${this.token}` : undefined;
    const res = this.mockDispatcher.handleCreatePromise(dto, authHeader);
    return { ok: res.status === 201, status: res.status, data: res.data };
  }

  async updatePromiseStatus(code, statusDto) {
    if (this.isLive) {
      return this.apiClient.patch(`/promises/${code}/status`, statusDto);
    }
    const authHeader = this.token ? `Bearer ${this.token}` : undefined;
    const res = this.mockDispatcher.handleUpdatePromiseStatus(code, statusDto, authHeader);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async getEvidence(query = {}) {
    if (this.isLive) {
      const q = new URLSearchParams(query).toString();
      return this.apiClient.get(`/evidence${q ? '?' + q : ''}`);
    }
    const res = this.mockDispatcher.handleGetEvidence(query);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async createEvidence(dto) {
    if (this.isLive) {
      return this.apiClient.post('/evidence', dto);
    }
    const authHeader = this.token ? `Bearer ${this.token}` : undefined;
    const res = this.mockDispatcher.handleCreateEvidence(dto, authHeader);
    return { ok: res.status === 201, status: res.status, data: res.data };
  }

  async reviewEvidence(id, reviewDto) {
    if (this.isLive) {
      return this.apiClient.patch(`/evidence/${id}/review`, reviewDto);
    }
    const authHeader = this.token ? `Bearer ${this.token}` : undefined;
    const res = this.mockDispatcher.handleReviewEvidence(id, reviewDto, authHeader);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async getIndicators() {
    if (this.isLive) {
      return this.apiClient.get('/indicators');
    }
    const res = this.mockDispatcher.handleGetIndicators();
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async createIndicatorValue(code, dto) {
    if (this.isLive) {
      return this.apiClient.post(`/indicators/${code}/values`, dto);
    }
    const authHeader = this.token ? `Bearer ${this.token}` : undefined;
    const res = this.mockDispatcher.handleCreateIndicatorValue(code, dto, authHeader);
    return { ok: res.status === 201, status: res.status, data: res.data };
  }

  async getScraperSources() {
    if (this.isLive) {
      return this.apiClient.get('/scraper/sources');
    }
    const res = this.mockDispatcher.handleGetScraperSources();
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async runScraperJob() {
    if (this.isLive) {
      return this.apiClient.post('/scraper/run', {});
    }
    const res = this.mockDispatcher.handleRunScraperJob();
    return { ok: res.status === 200 || res.status === 201, status: res.status, data: res.data };
  }

  async getDailyTally() {
    if (this.isLive) {
      return this.apiClient.get('/scraper/daily-tally');
    }
    const res = this.mockDispatcher.handleGetDailyTally();
    return { ok: res.status === 200, status: res.status, data: res.data };
  }

  async submitCitizenEvidence(dto) {
    if (this.isLive) {
      return this.apiClient.post('/scraper/citizen-evidence', dto);
    }
    const res = this.mockDispatcher.handleSubmitCitizenEvidence(dto);
    return { ok: res.status === 201, status: res.status, data: res.data };
  }

  async queryChat(dto) {
    if (this.isLive) {
      return this.apiClient.post('/chat/query', dto);
    }
    const res = this.mockDispatcher.handleQueryChat(dto);
    return { ok: res.status === 200, status: res.status, data: res.data };
  }
}
