/**
 * MeetingsView — Meeting management with list view and CRUD.
 */
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export class MeetingsView {
  constructor(store) {
    this.store = store;
    this.el = document.getElementById('view-meetings');
    this.statusFilter = 'all';
  }

  render() {
    this.el.innerHTML = `
      <div class="view-header">
        <div>
          <h1>Meetings</h1>
          <p class="view-subtitle">Schedule and track your project meetings.</p>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-primary" id="add-meeting-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Meeting
          </button>
        </div>
      </div>

      <div class="filter-tabs" id="meeting-status-filters">
        <button class="filter-tab active" data-status="all">All</button>
        <button class="filter-tab" data-status="upcoming">Upcoming</button>
        <button class="filter-tab" data-status="completed">Completed</button>
        <button class="filter-tab" data-status="cancelled">Cancelled</button>
      </div>

      <div class="meetings-list" id="meetings-list"></div>
    `;

    this._renderMeetings();
    this._bindEvents();
  }

  _renderMeetings() {
    let meetings = this.store.getMeetings();
    if (this.statusFilter !== 'all') {
      meetings = meetings.filter(m => m.status === this.statusFilter);
    }
    meetings.sort((a, b) => new Date(a.dateTime || 0) - new Date(b.dateTime || 0));

    const list = document.getElementById('meetings-list');

    if (meetings.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h3>No meetings scheduled</h3>
          <p>Add your first meeting to start tracking.</p>
        </div>`;
      return;
    }

    list.innerHTML = meetings.map(m => {
      const date = m.dateTime ? new Date(m.dateTime) : null;
      const day = date ? date.getDate() : '?';
      const month = date ? date.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
      const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

      return `
        <div class="meeting-card" data-id="${m.id}">
          <div class="meeting-date-col">
            <span class="meeting-day">${day}</span>
            <span class="meeting-month">${month}</span>
          </div>
          <div class="meeting-info">
            <div class="meeting-title">${m.title}</div>
            <div class="meeting-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeStr} ${m.duration ? `· ${m.duration} min` : ''}
              ${m.location ? ` · ${m.location}` : ''}
            </div>
            ${m.attendees ? `<div class="meeting-attendees">${m.attendees.split(',').slice(0, 5).map(a => `<div class="meeting-attendee-avatar">${a.trim()[0] || '?'}</div>`).join('')}</div>` : ''}
          </div>
          <span class="meeting-status ${m.status || 'upcoming'}">${m.status || 'upcoming'}</span>
          <div class="meeting-actions">
            <button class="task-action-btn edit" data-edit="${m.id}" title="Edit">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="task-action-btn delete" data-delete="${m.id}" title="Delete">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('[data-edit]').forEach(el => {
      el.addEventListener('click', (e) => { e.stopPropagation(); this._openMeetingModal(el.dataset.edit); });
    });

    list.querySelectorAll('[data-delete]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.deleteMeeting(el.dataset.delete);
        Toast.show('Meeting deleted', 'success');
        this._renderMeetings();
      });
    });
  }

  _bindEvents() {
    document.getElementById('add-meeting-btn').addEventListener('click', () => this._openMeetingModal());

    document.getElementById('meeting-status-filters').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      document.querySelectorAll('#meeting-status-filters .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.statusFilter = tab.dataset.status;
      this._renderMeetings();
    });
  }

  _openMeetingModal(editId = null) {
    const meeting = editId ? this.store.getMeetings().find(m => m.id === editId) : null;
    const title = meeting ? 'Edit Meeting' : 'Add New Meeting';

    const content = `
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input type="text" class="form-input" id="meeting-title" value="${meeting ? meeting.title : ''}" placeholder="Meeting title..." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Date & Time</label>
          <input type="datetime-local" class="form-input" id="meeting-datetime" value="${meeting ? meeting.dateTime || '' : ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Duration (minutes)</label>
          <input type="number" class="form-input" id="meeting-duration" value="${meeting ? meeting.duration || '' : ''}" placeholder="30" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Location / Link</label>
        <input type="text" class="form-input" id="meeting-location" value="${meeting ? meeting.location || '' : ''}" placeholder="Office, Zoom link, etc." />
      </div>
      <div class="form-group">
        <label class="form-label">Attendees (comma-separated)</label>
        <input type="text" class="form-input" id="meeting-attendees" value="${meeting ? meeting.attendees || '' : ''}" placeholder="Ayush, Sina, ..." />
      </div>
      <div class="form-group">
        <label class="form-label">Agenda / Notes</label>
        <textarea class="form-textarea" id="meeting-notes" placeholder="Meeting agenda...">${meeting ? meeting.notes || '' : ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="meeting-status">
          <option value="upcoming" ${meeting && meeting.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
          <option value="completed" ${meeting && meeting.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${meeting && meeting.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>
    `;

    Modal.open({
      title,
      content,
      onSave: (close) => {
        const titleVal = document.getElementById('meeting-title').value.trim();
        if (!titleVal) { Toast.show('Title is required', 'error'); return; }

        const data = {
          title: titleVal,
          dateTime: document.getElementById('meeting-datetime').value,
          duration: document.getElementById('meeting-duration').value,
          location: document.getElementById('meeting-location').value.trim(),
          attendees: document.getElementById('meeting-attendees').value.trim(),
          notes: document.getElementById('meeting-notes').value.trim(),
          status: document.getElementById('meeting-status').value,
        };

        if (meeting) {
          this.store.updateMeeting(meeting.id, data);
          Toast.show('Meeting updated', 'success');
        } else {
          this.store.addMeeting(data);
          Toast.show('Meeting added', 'success');
        }
        close();
        this._renderMeetings();
      },
      onDelete: meeting ? (close) => {
        this.store.deleteMeeting(meeting.id);
        Toast.show('Meeting deleted', 'success');
        close();
        this._renderMeetings();
      } : null,
    });
  }
}
