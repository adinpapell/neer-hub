/**
 * IssuesView — Case issue tracker.
 * Track issues by case number with status (Needs Attention / In Progress / Resolved).
 */
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export class IssuesView {
  constructor(store) {
    this.store = store;
    this.el = document.getElementById('view-issues');
    this.statusFilter = 'all';
    this.searchQuery = '';
  }

  render() {
    const issues = this.store.getIssues();
    const needsAttention = issues.filter(i => i.status === 'needs-attention').length;
    const inProgress = issues.filter(i => i.status === 'in-progress').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;

    this.el.innerHTML = `
      <div class="view-header">
        <div>
          <h1>Issues</h1>
          <p class="view-subtitle">Track case issues and resolution status.</p>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-primary" id="add-issue-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Report Issue
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="issue-stats">
        <div class="issue-stat-card attention">
          <div class="issue-stat-value">${needsAttention}</div>
          <div class="issue-stat-label">Needs Attention</div>
        </div>
        <div class="issue-stat-card progress">
          <div class="issue-stat-value">${inProgress}</div>
          <div class="issue-stat-label">In Progress</div>
        </div>
        <div class="issue-stat-card resolved">
          <div class="issue-stat-value">${resolved}</div>
          <div class="issue-stat-label">Resolved</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="issues-toolbar">
        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="form-input" id="issue-search" placeholder="Search by case # or description..." />
        </div>
      </div>

      <div class="filter-tabs" id="issue-status-filters">
        <button class="filter-tab active" data-status="all">All (${issues.length})</button>
        <button class="filter-tab" data-status="needs-attention">🔴 Needs Attention (${needsAttention})</button>
        <button class="filter-tab" data-status="in-progress">🟡 In Progress (${inProgress})</button>
        <button class="filter-tab" data-status="resolved">🟢 Resolved (${resolved})</button>
      </div>

      <div class="data-list" id="issues-list"></div>
    `;

    this._renderIssues();
    this._bindEvents();
  }

  _renderIssues() {
    const issues = this._getFilteredIssues();
    const list = document.getElementById('issues-list');

    if (issues.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3>No issues found</h3>
          <p>Report an issue or adjust your filters.</p>
        </div>`;
      return;
    }

    list.innerHTML = issues.map(issue => `
      <div class="issue-row ${issue.status === 'resolved' ? 'resolved' : ''}" data-id="${issue.id}">
        <div class="issue-case-num">#${issue.caseNumber}</div>
        <div class="priority-dot ${issue.priority || 'medium'}"></div>
        <div class="issue-info">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.description || ''}</div>
          <div class="issue-meta">
            ${issue.category ? `<span class="badge badge-${(issue.category || '').toLowerCase().replace(/\s+/g, '')}">${issue.category}</span>` : ''}
            ${issue.reportedBy ? `<span style="font-size:var(--font-xs);color:var(--text-muted);">by ${issue.reportedBy}</span>` : ''}
          </div>
        </div>
        <span class="issue-status ${issue.status}">${this._statusLabel(issue.status)}</span>
        <div class="issue-date">${issue.dateReported ? this._formatDate(issue.dateReported) : ''}</div>
        <div class="issue-actions">
          <button class="task-action-btn edit" data-edit="${issue.id}" title="Edit">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="task-action-btn delete" data-delete="${issue.id}" title="Delete">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-edit]').forEach(el => {
      el.addEventListener('click', (e) => { e.stopPropagation(); this._openIssueModal(el.dataset.edit); });
    });

    list.querySelectorAll('[data-delete]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.deleteIssue(el.dataset.delete);
        Toast.show('Issue deleted', 'success');
        this.render();
      });
    });
  }

  _getFilteredIssues() {
    let issues = this.store.getIssues();
    if (this.statusFilter !== 'all') {
      issues = issues.filter(i => i.status === this.statusFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      issues = issues.filter(i =>
        (i.caseNumber || '').toLowerCase().includes(q) ||
        (i.title || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q)
      );
    }
    // Sort: needs-attention first, then in-progress, then resolved
    const statusOrder = { 'needs-attention': 0, 'in-progress': 1, 'resolved': 2 };
    return issues.sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
  }

  _bindEvents() {
    document.getElementById('add-issue-btn').addEventListener('click', () => this._openIssueModal());

    document.getElementById('issue-search').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this._renderIssues();
    });

    document.getElementById('issue-status-filters').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      document.querySelectorAll('#issue-status-filters .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.statusFilter = tab.dataset.status;
      this._renderIssues();
    });
  }

  _openIssueModal(editId = null) {
    const issue = editId ? this.store.getIssues().find(i => i.id === editId) : null;
    const categories = this.store.getCategories();
    const title = issue ? 'Edit Issue' : 'Report New Issue';

    const content = `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Case Number *</label>
          <input type="text" class="form-input" id="issue-case" value="${issue ? issue.caseNumber : ''}" placeholder="e.g. 1234" />
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" id="issue-priority">
            <option value="high" ${issue && issue.priority === 'high' ? 'selected' : ''}>🔴 High</option>
            <option value="medium" ${issue && issue.priority === 'medium' ? 'selected' : ''}>🟡 Medium</option>
            <option value="low" ${issue && issue.priority === 'low' ? 'selected' : ''}>🔵 Low</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Issue Title *</label>
        <input type="text" class="form-input" id="issue-title" value="${issue ? issue.title : ''}" placeholder="Brief description of the issue..." />
      </div>
      <div class="form-group">
        <label class="form-label">Details</label>
        <textarea class="form-textarea" id="issue-desc" placeholder="What went wrong? Include specifics...">${issue ? issue.description || '' : ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="issue-category">
            <option value="">— None —</option>
            ${categories.map(c => `<option value="${c.name}" ${issue && issue.category === c.name ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="issue-status">
            <option value="needs-attention" ${issue && issue.status === 'needs-attention' ? 'selected' : ''}>🔴 Needs Attention</option>
            <option value="in-progress" ${issue && issue.status === 'in-progress' ? 'selected' : ''}>🟡 In Progress</option>
            <option value="resolved" ${issue && issue.status === 'resolved' ? 'selected' : ''}>🟢 Resolved</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Reported By</label>
          <input type="text" class="form-input" id="issue-reported-by" value="${issue ? issue.reportedBy || '' : ''}" placeholder="Name..." />
        </div>
        <div class="form-group">
          <label class="form-label">Date Reported</label>
          <input type="date" class="form-input" id="issue-date" value="${issue ? issue.dateReported || '' : new Date().toISOString().slice(0, 10)}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Resolution Notes</label>
        <textarea class="form-textarea" id="issue-resolution" placeholder="How was it resolved?">${issue ? issue.resolution || '' : ''}</textarea>
      </div>
    `;

    Modal.open({
      title,
      content,
      saveLabel: issue ? 'Save' : 'Report Issue',
      onSave: (close) => {
        const caseNumber = document.getElementById('issue-case').value.trim();
        const titleVal = document.getElementById('issue-title').value.trim();
        if (!caseNumber || !titleVal) {
          Toast.show('Case number and title are required', 'error');
          return;
        }

        const data = {
          caseNumber,
          title: titleVal,
          description: document.getElementById('issue-desc').value.trim(),
          category: document.getElementById('issue-category').value,
          priority: document.getElementById('issue-priority').value,
          status: document.getElementById('issue-status').value,
          reportedBy: document.getElementById('issue-reported-by').value.trim(),
          dateReported: document.getElementById('issue-date').value,
          resolution: document.getElementById('issue-resolution').value.trim(),
        };

        if (issue) {
          this.store.updateIssue(issue.id, data);
          Toast.show('Issue updated', 'success');
        } else {
          this.store.addIssue(data);
          Toast.show('Issue reported', 'success');
        }
        close();
        this.render();
      },
      onDelete: issue ? (close) => {
        this.store.deleteIssue(issue.id);
        Toast.show('Issue deleted', 'success');
        close();
        this.render();
      } : null,
    });
  }

  _statusLabel(status) {
    switch (status) {
      case 'needs-attention': return 'Needs Attention';
      case 'in-progress':     return 'In Progress';
      case 'resolved':        return 'Resolved';
      default:                return status;
    }
  }

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
