/**
 * Store — Data persistence layer for Neer Hub.
 * Uses REST API for shared storage across all devices.
 * Polls for changes every 3 seconds for live updates.
 */
export class Store {
  constructor() {
    this._listeners = {};
    this._data = { tasks: [], contacts: [], meetings: [], ganttItems: [], categories: [], issues: [] };
    this._lastModified = 0;
    this._polling = false;
    this._apiBase = this._getApiBase();
  }

  /** Determine the API base URL (handles both dev proxy and production). */
  _getApiBase() {
    return window.location.origin;
  }

  /** Load all data from the server. Call this on app startup. */
  async init() {
    await this._fetchAll();
    this._startPolling();
  }

  /* ── Public Getters ── */

  getTasks()      { return this._data.tasks || []; }
  getContacts()   { return this._data.contacts || []; }
  getMeetings()   { return this._data.meetings || []; }
  getGanttItems() { return this._data.ganttItems || []; }
  getCategories() { return this._data.categories || []; }
  getIssues()     { return this._data.issues || []; }

  /* ── CRUD: Tasks ── */

  async addTask(task) {
    const created = await this._post('/api/tasks', task);
    if (created) { await this._fetchAll(); this._emit('tasks'); }
    return created;
  }

  async updateTask(id, updates) {
    const updated = await this._put(`/api/tasks/${id}`, updates);
    if (updated) { await this._fetchAll(); this._emit('tasks'); }
    return updated;
  }

  async deleteTask(id) {
    await this._delete(`/api/tasks/${id}`);
    await this._fetchAll();
    this._emit('tasks');
  }

  /* ── CRUD: Contacts ── */

  async addContact(contact) {
    const created = await this._post('/api/contacts', contact);
    if (created) { await this._fetchAll(); this._emit('contacts'); }
    return created;
  }

  async updateContact(id, updates) {
    const updated = await this._put(`/api/contacts/${id}`, updates);
    if (updated) { await this._fetchAll(); this._emit('contacts'); }
    return updated;
  }

  async deleteContact(id) {
    await this._delete(`/api/contacts/${id}`);
    await this._fetchAll();
    this._emit('contacts');
  }

  /* ── CRUD: Meetings ── */

  async addMeeting(meeting) {
    const created = await this._post('/api/meetings', meeting);
    if (created) { await this._fetchAll(); this._emit('meetings'); }
    return created;
  }

  async updateMeeting(id, updates) {
    const updated = await this._put(`/api/meetings/${id}`, updates);
    if (updated) { await this._fetchAll(); this._emit('meetings'); }
    return updated;
  }

  async deleteMeeting(id) {
    await this._delete(`/api/meetings/${id}`);
    await this._fetchAll();
    this._emit('meetings');
  }

  /* ── CRUD: Gantt Items ── */

  async addGanttItem(item) {
    const created = await this._post('/api/ganttItems', item);
    if (created) { await this._fetchAll(); this._emit('ganttItems'); }
    return created;
  }

  async updateGanttItem(id, updates) {
    const updated = await this._put(`/api/ganttItems/${id}`, updates);
    if (updated) { await this._fetchAll(); this._emit('ganttItems'); }
    return updated;
  }

  async deleteGanttItem(id) {
    await this._delete(`/api/ganttItems/${id}`);
    await this._fetchAll();
    this._emit('ganttItems');
  }

  /* ── CRUD: Categories ── */

  async addCategory(category) {
    const created = await this._post('/api/categories', category);
    if (created) { await this._fetchAll(); this._emit('categories'); }
    return created;
  }

  async updateCategory(id, updates) {
    const updated = await this._put(`/api/categories/${id}`, updates);
    if (updated) { await this._fetchAll(); this._emit('categories'); }
    return updated;
  }

  async deleteCategory(id) {
    await this._delete(`/api/categories/${id}`);
    await this._fetchAll();
    this._emit('categories');
  }

  /* ── CRUD: Issues ── */

  async addIssue(issue) {
    const created = await this._post('/api/issues', issue);
    if (created) { await this._fetchAll(); this._emit('issues'); }
    return created;
  }

  async updateIssue(id, updates) {
    const updated = await this._put(`/api/issues/${id}`, updates);
    if (updated) { await this._fetchAll(); this._emit('issues'); }
    return updated;
  }

  async deleteIssue(id) {
    await this._delete(`/api/issues/${id}`);
    await this._fetchAll();
    this._emit('issues');
  }

  /* ── Export / Import ── */

  exportData() {
    const blob = new Blob([JSON.stringify(this._data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neer-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const res = await fetch(`${this._apiBase}/api/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this._fetchAll();
        this._emitAll();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async clearAll() {
    await fetch(`${this._apiBase}/api/clear`, { method: 'POST' });
    await this._fetchAll();
    this._emitAll();
  }

  /* ── Events ── */

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  /* ── Polling for Live Updates ── */

  _startPolling() {
    if (this._polling) return;
    this._polling = true;
    setInterval(() => this._checkForUpdates(), 3000);
  }

  async _checkForUpdates() {
    try {
      const res = await fetch(`${this._apiBase}/api/last-modified`);
      const { lastModified } = await res.json();
      if (lastModified > this._lastModified) {
        this._lastModified = lastModified;
        await this._fetchAll();
        this._emitAll();
      }
    } catch {
      // Server unavailable — silent fail
    }
  }

  /* ── Private: HTTP helpers ── */

  async _fetchAll() {
    try {
      const res = await fetch(`${this._apiBase}/api/data`);
      const data = await res.json();
      this._data = data;
      this._lastModified = data.lastModified || Date.now();
    } catch {
      // Offline fallback — keep existing data
    }
  }

  async _post(url, body) {
    try {
      const res = await fetch(`${this._apiBase}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }

  async _put(url, body) {
    try {
      const res = await fetch(`${this._apiBase}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }

  async _delete(url) {
    try {
      await fetch(`${this._apiBase}${url}`, { method: 'DELETE' });
    } catch { /* silent */ }
  }

  /* ── Private: Event helpers ── */

  _emit(event) {
    (this._listeners[event] || []).forEach(cb => cb(this._data[event]));
    (this._listeners['*'] || []).forEach(cb => cb(event, this._data[event]));
  }

  _emitAll() {
    ['tasks', 'contacts', 'meetings', 'ganttItems', 'categories', 'issues'].forEach(k => this._emit(k));
  }
}
