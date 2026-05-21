/**
 * TasksView — Full task management page.
 * CRUD operations, filtering by category/priority/status, search.
 */
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export class TasksView {
  constructor(store) {
    this.store = store;
    this.el = document.getElementById('view-tasks');
    this.filter = 'all';
    this.statusFilter = 'all';
    this.searchQuery = '';
  }

  render() {
    const categories = this.store.getCategories();
    this.el.innerHTML = `
      <div class="view-header">
        <div>
          <h1>To-Dos</h1>
          <p class="view-subtitle">Track all your tasks and issues across workstreams.</p>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-primary" id="add-task-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Task
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="tasks-toolbar">
        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="form-input" id="task-search" placeholder="Search tasks..." />
        </div>
      </div>

      <div class="filter-tabs" id="category-filters">
        <button class="filter-tab active" data-filter="all">All</button>
        ${categories.map(c => `<button class="filter-tab" data-filter="${c.name}">${c.icon} ${c.name}</button>`).join('')}
      </div>

      <div class="filter-tabs" id="status-filters" style="margin-top: calc(var(--space-2) * -1);">
        <button class="filter-tab active" data-status="all">All Status</button>
        <button class="filter-tab" data-status="todo">To Do</button>
        <button class="filter-tab" data-status="in-progress">In Progress</button>
        <button class="filter-tab" data-status="done">Done</button>
      </div>

      <div class="data-list" id="tasks-list"></div>
    `;

    this._renderTasks();
    this._bindEvents();
  }

  _renderTasks() {
    const tasks = this._getFilteredTasks();
    const listEl = document.getElementById('tasks-list');

    if (tasks.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          <h3>No tasks found</h3>
          <p>Add a new task or adjust your filters.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = tasks.map(t => {
      const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';
      const catClass = t.category ? t.category.toLowerCase().replace(/\s+/g, '') : 'other';
      return `
        <div class="task-row ${t.status === 'done' ? 'completed' : ''}" data-id="${t.id}">
          <div class="checkbox ${t.status === 'done' ? 'checked' : ''}" data-toggle="${t.id}"></div>
          <div class="priority-dot ${t.priority}"></div>
          <div class="task-info">
            <div class="task-title">${t.title}</div>
            <div class="task-meta">
              <span class="badge badge-${catClass}">${t.category}</span>
              <span class="badge badge-${t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'yellow' : 'blue'}">${t.priority}</span>
            </div>
          </div>
          <span class="task-due ${isOverdue ? 'overdue' : ''}">${t.dueDate ? this._formatDate(t.dueDate) : '—'}</span>
          <div class="task-actions">
            <button class="task-action-btn edit" data-edit="${t.id}" title="Edit">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="task-action-btn delete" data-delete="${t.id}" title="Delete">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind row events
    listEl.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.toggle;
        const task = this.store.getTasks().find(t => t.id === id);
        this.store.updateTask(id, { status: task.status === 'done' ? 'todo' : 'done' });
        this._renderTasks();
      });
    });

    listEl.querySelectorAll('[data-edit]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openTaskModal(el.dataset.edit);
      });
    });

    listEl.querySelectorAll('[data-delete]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.deleteTask(el.dataset.delete);
        Toast.show('Task deleted', 'success');
        this._renderTasks();
      });
    });
  }

  _getFilteredTasks() {
    let tasks = this.store.getTasks();
    if (this.filter !== 'all') {
      tasks = tasks.filter(t => t.category === this.filter);
    }
    if (this.statusFilter !== 'all') {
      tasks = tasks.filter(t => t.status === this.statusFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }
    return tasks.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }

  _bindEvents() {
    document.getElementById('add-task-btn').addEventListener('click', () => this._openTaskModal());

    document.getElementById('task-search').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this._renderTasks();
    });

    document.getElementById('category-filters').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      document.querySelectorAll('#category-filters .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.filter = tab.dataset.filter;
      this._renderTasks();
    });

    document.getElementById('status-filters').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      document.querySelectorAll('#status-filters .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.statusFilter = tab.dataset.status;
      this._renderTasks();
    });
  }

  _openTaskModal(editId = null) {
    const task = editId ? this.store.getTasks().find(t => t.id === editId) : null;
    const categories = this.store.getCategories();
    const title = task ? 'Edit Task' : 'Add New Task';

    const content = `
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input type="text" class="form-input" id="task-title" value="${task ? task.title : ''}" placeholder="Task title..." />
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" id="task-desc" placeholder="Details...">${task ? task.description || '' : ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="task-category">
            ${categories.map(c => `<option value="${c.name}" ${task && task.category === c.name ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" id="task-priority">
            <option value="high" ${task && task.priority === 'high' ? 'selected' : ''}>🔴 High</option>
            <option value="medium" ${task && task.priority === 'medium' ? 'selected' : ''}>🟡 Medium</option>
            <option value="low" ${task && task.priority === 'low' ? 'selected' : ''}>🔵 Low</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input type="date" class="form-input" id="task-due" value="${task ? task.dueDate || '' : ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="task-status">
            <option value="todo" ${task && task.status === 'todo' ? 'selected' : ''}>To Do</option>
            <option value="in-progress" ${task && task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="done" ${task && task.status === 'done' ? 'selected' : ''}>Done</option>
          </select>
        </div>
      </div>
    `;

    Modal.open({
      title,
      content,
      onSave: (close) => {
        const titleVal = document.getElementById('task-title').value.trim();
        if (!titleVal) { Toast.show('Title is required', 'error'); return; }

        const data = {
          title: titleVal,
          description: document.getElementById('task-desc').value.trim(),
          category: document.getElementById('task-category').value,
          priority: document.getElementById('task-priority').value,
          dueDate: document.getElementById('task-due').value,
          status: document.getElementById('task-status').value,
        };

        if (task) {
          this.store.updateTask(task.id, data);
          Toast.show('Task updated', 'success');
        } else {
          this.store.addTask(data);
          Toast.show('Task added', 'success');
        }
        close();
        this._renderTasks();
      },
      onDelete: task ? (close) => {
        this.store.deleteTask(task.id);
        Toast.show('Task deleted', 'success');
        close();
        this._renderTasks();
      } : null,
    });
  }

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
