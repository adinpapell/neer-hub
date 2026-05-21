/**
 * DashboardView — Overview page showing stats, upcoming tasks,
 * issues by workstream, and upcoming meetings.
 */
export class DashboardView {
  constructor(store) {
    this.store = store;
    this.el = document.getElementById('view-dashboard');
  }

  render() {
    const tasks = this.store.getTasks();
    const contacts = this.store.getContacts();
    const meetings = this.store.getMeetings();
    const ganttItems = this.store.getGanttItems();
    const categories = this.store.getCategories();

    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');

    this.el.innerHTML = `
      <div class="view-header">
        <div>
          <h1>Dashboard</h1>
          <p class="view-subtitle">Welcome back. Here's your project overview.</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="dashboard-stats">
        ${this._statCard('pink', this._iconTasks(), tasks.length, 'Total Tasks')}
        ${this._statCard('yellow', this._iconWarning(), overdueTasks.length, 'Overdue')}
        ${this._statCard('blue', this._iconContacts(), contacts.length, 'Contacts')}
        ${this._statCard('green', this._iconGantt(), ganttItems.length, 'Milestones')}
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid">
        <!-- Upcoming Tasks -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3 class="section-title">
              ${this._svgIcon('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>')}
              Upcoming Tasks
            </h3>
            <span class="badge badge-pink">${todoCount + inProgressCount} active</span>
          </div>
          ${this._renderUpcomingTasks(tasks)}
        </div>

        <!-- Issues by Workstream -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3 class="section-title">
              ${this._svgIcon('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')}
              Issues by Workstream
            </h3>
          </div>
          ${this._renderIssuesByCategory(tasks, categories)}
        </div>

        <!-- Gantt Progress -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3 class="section-title">
              ${this._svgIcon('<line x1="4" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>')}
              Milestone Progress
            </h3>
          </div>
          ${this._renderGanttProgress(ganttItems)}
        </div>

        <!-- Recent Activity -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3 class="section-title">
              ${this._svgIcon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')}
              Upcoming Meetings
            </h3>
          </div>
          ${this._renderUpcomingMeetings(meetings)}
        </div>
      </div>
    `;
  }

  _statCard(color, icon, value, label) {
    return `
      <div class="stat-card ${color}">
        <div class="stat-icon">${icon}</div>
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    `;
  }

  _renderUpcomingTasks(tasks) {
    const upcoming = tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      })
      .slice(0, 6);

    if (upcoming.length === 0) {
      return '<p style="color:var(--text-muted);font-size:var(--font-sm);">No active tasks.</p>';
    }

    return upcoming.map(t => {
      const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
      return `
        <div class="quick-task ${isOverdue ? 'overdue' : ''}">
          <div class="priority-dot ${t.priority}"></div>
          <span class="quick-task-title">${t.title}</span>
          <span class="quick-task-date">${t.dueDate ? this._formatDate(t.dueDate) : 'No date'}</span>
        </div>
      `;
    }).join('');
  }

  _renderIssuesByCategory(tasks, categories) {
    const activeTasks = tasks.filter(t => t.status !== 'done');
    return categories.map(cat => {
      const count = activeTasks.filter(t => t.category === cat.name).length;
      const total = activeTasks.length || 1;
      const pct = Math.round((count / total) * 100);
      return `
        <div class="issue-count">
          <span class="issue-label" style="color:${cat.color}">${cat.icon} ${cat.name}</span>
          <div class="issue-bar">
            <div class="issue-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
          </div>
          <span class="issue-num">${count}</span>
        </div>
      `;
    }).join('');
  }

  _renderGanttProgress(items) {
    if (items.length === 0) {
      return '<p style="color:var(--text-muted);font-size:var(--font-sm);">No milestones yet.</p>';
    }
    return items.slice(0, 5).map(item => `
      <div class="issue-count">
        <span class="issue-label">${item.title}</span>
        <div class="issue-bar">
          <div class="issue-bar-fill" style="width:${item.progress}%;background:var(--accent)"></div>
        </div>
        <span class="issue-num">${item.progress}%</span>
      </div>
    `).join('');
  }

  _renderUpcomingMeetings(meetings) {
    const upcoming = meetings
      .filter(m => m.status !== 'cancelled')
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .slice(0, 4);

    if (upcoming.length === 0) {
      return '<p style="color:var(--text-muted);font-size:var(--font-sm);">No meetings scheduled. Add one from the Meetings page.</p>';
    }

    return upcoming.map(m => `
      <div class="quick-task">
        <span class="quick-task-title">${m.title}</span>
        <span class="quick-task-date">${this._formatDateTime(m.dateTime)}</span>
      </div>
    `).join('');
  }

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  _formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  _svgIcon(paths) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${paths}</svg>`;
  }

  _iconTasks() {
    return this._svgIcon('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>');
  }

  _iconWarning() {
    return this._svgIcon('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
  }

  _iconContacts() {
    return this._svgIcon('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/>');
  }

  _iconGantt() {
    return this._svgIcon('<line x1="4" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>');
  }
}
