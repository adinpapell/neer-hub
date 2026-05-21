/**
 * GanttView — Interactive Gantt chart for project milestones.
 * Custom-built timeline with add/edit/delete and progress tracking.
 */
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export class GanttView {
  constructor(store) {
    this.store = store;
    this.el = document.getElementById('view-gantt');
    this.viewMode = 'weeks'; // 'days', 'weeks', 'months'
  }

  render() {
    this.el.innerHTML = `
      <div class="view-header">
        <div>
          <h1>Gantt Chart</h1>
          <p class="view-subtitle">Project milestones and timelines — fully adjustable.</p>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-primary" id="add-gantt-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Milestone
          </button>
        </div>
      </div>

      <div class="gantt-wrapper">
        <div class="gantt-toolbar">
          <div class="view-modes">
            <button class="filter-tab ${this.viewMode === 'days' ? 'active' : ''}" data-mode="days">Days</button>
            <button class="filter-tab ${this.viewMode === 'weeks' ? 'active' : ''}" data-mode="weeks">Weeks</button>
            <button class="filter-tab ${this.viewMode === 'months' ? 'active' : ''}" data-mode="months">Months</button>
          </div>
          <div class="gantt-legend" id="gantt-legend"></div>
        </div>
        <div class="gantt-chart" id="gantt-chart"></div>
      </div>
    `;

    this._renderChart();
    this._renderLegend();
    this._bindEvents();
  }

  _renderChart() {
    const items = this.store.getGanttItems();
    const chart = document.getElementById('gantt-chart');

    if (items.length === 0) {
      chart.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>
          <h3>No milestones yet</h3>
          <p>Add your first project milestone to see the timeline.</p>
        </div>`;
      return;
    }

    // Calculate date range
    const { startDate, endDate, dateCells } = this._calculateDateRange(items);

    chart.innerHTML = `
      <div class="gantt-header">
        <div class="gantt-label-col">Milestone</div>
        <div class="gantt-timeline-col">
          ${dateCells.map(d => `
            <div class="gantt-date-cell ${d.isToday ? 'today' : ''}">${d.label}</div>
          `).join('')}
        </div>
      </div>
      <div class="gantt-rows">
        ${items.map(item => this._renderGanttRow(item, startDate, endDate, dateCells.length)).join('')}
      </div>
    `;

    // Bind row clicks
    chart.querySelectorAll('.gantt-row').forEach(row => {
      row.addEventListener('click', () => this._openGanttModal(row.dataset.id));
    });
  }

  _renderGanttRow(item, rangeStart, rangeEnd, totalCells) {
    const itemStart = new Date(item.startDate + 'T00:00:00');
    const itemEnd = new Date(item.endDate + 'T00:00:00');
    const rangeDuration = rangeEnd - rangeStart;

    const leftPct = Math.max(0, ((itemStart - rangeStart) / rangeDuration) * 100);
    const widthPct = Math.max(2, ((itemEnd - itemStart) / rangeDuration) * 100);
    const catClass = (item.category || 'other').toLowerCase().replace(/\s+/g, '');

    const statusIcon = item.status === 'in-progress' ? '◐' : item.status === 'completed' ? '●' : '○';

    return `
      <div class="gantt-row" data-id="${item.id}">
        <div class="gantt-row-label">
          <span style="opacity:0.5">${statusIcon}</span>
          ${item.title}
        </div>
        <div class="gantt-row-timeline">
          <div class="gantt-bar ${catClass}" style="left:${leftPct}%;width:${widthPct}%;">
            <div class="gantt-bar-progress" style="width:${item.progress || 0}%"></div>
            <span style="position:relative;z-index:1;">${item.progress || 0}%</span>
          </div>
        </div>
      </div>
    `;
  }

  _calculateDateRange(items) {
    let earliest = Infinity;
    let latest = -Infinity;

    items.forEach(item => {
      const s = new Date(item.startDate + 'T00:00:00').getTime();
      const e = new Date(item.endDate + 'T00:00:00').getTime();
      if (s < earliest) earliest = s;
      if (e > latest) latest = e;
    });

    // Add padding
    const padding = (latest - earliest) * 0.05 || 7 * 24 * 60 * 60 * 1000;
    const startDate = new Date(earliest - padding);
    const endDate = new Date(latest + padding);

    // Generate date cells based on view mode
    const dateCells = [];
    const cursor = new Date(startDate);

    if (this.viewMode === 'days') {
      while (cursor <= endDate) {
        dateCells.push({
          label: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
          isToday: this._isToday(cursor),
        });
        cursor.setDate(cursor.getDate() + 1);
        if (dateCells.length > 90) break;
      }
    } else if (this.viewMode === 'weeks') {
      while (cursor <= endDate) {
        dateCells.push({
          label: `${cursor.toLocaleString('en-US', { month: 'short' })} ${cursor.getDate()}`,
          isToday: this._isThisWeek(cursor),
        });
        cursor.setDate(cursor.getDate() + 7);
        if (dateCells.length > 30) break;
      }
    } else {
      while (cursor <= endDate) {
        dateCells.push({
          label: cursor.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
          isToday: cursor.getMonth() === new Date().getMonth() && cursor.getFullYear() === new Date().getFullYear(),
        });
        cursor.setMonth(cursor.getMonth() + 1);
        if (dateCells.length > 24) break;
      }
    }

    return { startDate, endDate, dateCells };
  }

  _isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  _isThisWeek(date) {
    const today = new Date();
    const diff = Math.abs(today - date);
    return diff < 7 * 24 * 60 * 60 * 1000;
  }

  _renderLegend() {
    const categories = this.store.getCategories();
    const legend = document.getElementById('gantt-legend');
    legend.innerHTML = categories.map(c => `
      <div class="gantt-legend-item">
        <div class="gantt-legend-dot" style="background:${c.color}"></div>
        <span>${c.name}</span>
      </div>
    `).join('');
  }

  _bindEvents() {
    document.getElementById('add-gantt-btn').addEventListener('click', () => this._openGanttModal());

    this.el.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewMode = btn.dataset.mode;
        this.render();
      });
    });
  }

  _openGanttModal(editId = null) {
    const item = editId ? this.store.getGanttItems().find(g => g.id === editId) : null;
    const categories = this.store.getCategories();
    const title = item ? 'Edit Milestone' : 'Add New Milestone';

    const content = `
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input type="text" class="form-input" id="gantt-title" value="${item ? item.title : ''}" placeholder="Milestone name..." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="gantt-category">
            ${categories.map(c => `<option value="${c.name}" ${item && item.category === c.name ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="gantt-status">
            <option value="not-started" ${item && item.status === 'not-started' ? 'selected' : ''}>Not Started</option>
            <option value="in-progress" ${item && item.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${item && item.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Start Date *</label>
          <input type="date" class="form-input" id="gantt-start" value="${item ? item.startDate : ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">End Date *</label>
          <input type="date" class="form-input" id="gantt-end" value="${item ? item.endDate : ''}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Progress: <strong id="progress-val">${item ? item.progress : 0}%</strong></label>
        <input type="range" min="0" max="100" step="5" class="form-input" id="gantt-progress" value="${item ? item.progress : 0}" style="padding:0;border:none;background:transparent;" />
      </div>
    `;

    Modal.open({
      title,
      content,
      onSave: (close) => {
        const titleVal = document.getElementById('gantt-title').value.trim();
        const startDate = document.getElementById('gantt-start').value;
        const endDate = document.getElementById('gantt-end').value;
        if (!titleVal || !startDate || !endDate) {
          Toast.show('Title, start date, and end date are required', 'error');
          return;
        }

        const data = {
          title: titleVal,
          category: document.getElementById('gantt-category').value,
          status: document.getElementById('gantt-status').value,
          startDate,
          endDate,
          progress: parseInt(document.getElementById('gantt-progress').value),
        };

        if (item) {
          this.store.updateGanttItem(item.id, data);
          Toast.show('Milestone updated', 'success');
        } else {
          this.store.addGanttItem(data);
          Toast.show('Milestone added', 'success');
        }
        close();
        this._renderChart();
        this._renderLegend();
      },
      onDelete: item ? (close) => {
        this.store.deleteGanttItem(item.id);
        Toast.show('Milestone deleted', 'success');
        close();
        this._renderChart();
      } : null,
    });

    // Range slider live update
    const slider = document.getElementById('gantt-progress');
    const valDisplay = document.getElementById('progress-val');
    if (slider && valDisplay) {
      slider.addEventListener('input', () => { valDisplay.textContent = slider.value + '%'; });
    }
  }
}
