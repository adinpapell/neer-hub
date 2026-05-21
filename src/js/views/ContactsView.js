/**
 * ContactsView — Contact directory with cards, search, and CRUD.
 */
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export class ContactsView {
  constructor(store) {
    this.store = store;
    this.el = document.getElementById('view-contacts');
    this.searchQuery = '';
    this.tagFilter = 'all';
  }

  render() {
    this.el.innerHTML = `
      <div class="view-header">
        <div>
          <h1>Contacts</h1>
          <p class="view-subtitle">Your project contacts directory.</p>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-primary" id="add-contact-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Contact
          </button>
        </div>
      </div>

      <div class="tasks-toolbar">
        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="form-input" id="contact-search" placeholder="Search contacts..." />
        </div>
      </div>

      <div class="contacts-grid" id="contacts-grid"></div>
    `;

    this._renderContacts();
    this._bindEvents();
  }

  _renderContacts() {
    const contacts = this._getFilteredContacts();
    const grid = document.getElementById('contacts-grid');

    if (contacts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <h3>No contacts yet</h3>
          <p>Add your first contact to get started.</p>
        </div>`;
      return;
    }

    grid.innerHTML = contacts.map(c => `
      <div class="contact-card" data-id="${c.id}">
        <div class="contact-actions">
          <button class="task-action-btn edit" data-edit="${c.id}" title="Edit">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="task-action-btn delete" data-delete="${c.id}" title="Delete">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
        <div class="contact-header">
          <div class="contact-avatar">${this._getInitials(c.name)}</div>
          <div>
            <div class="contact-name">${c.name}</div>
            <div class="contact-role">${c.role || ''} ${c.company ? '· ' + c.company : ''}</div>
          </div>
        </div>
        <div class="contact-details">
          ${c.email ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><a href="mailto:${c.email}">${c.email}</a></div>` : ''}
          ${c.phone ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg><a href="tel:${c.phone}">${c.phone}</a></div>` : ''}
          ${c.notes ? `<div class="contact-detail" style="color:var(--text-muted);font-size:var(--font-xs);">${c.notes}</div>` : ''}
        </div>
        ${c.tags && c.tags.length ? `<div class="contact-tags">${c.tags.map(tag => `<span class="badge badge-pink">${tag}</span>`).join('')}</div>` : ''}
      </div>
    `).join('');

    // Bind card events
    grid.querySelectorAll('[data-edit]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openContactModal(el.dataset.edit);
      });
    });

    grid.querySelectorAll('[data-delete]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.deleteContact(el.dataset.delete);
        Toast.show('Contact deleted', 'success');
        this._renderContacts();
      });
    });
  }

  _getFilteredContacts() {
    let contacts = this.store.getContacts();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      );
    }
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  }

  _bindEvents() {
    document.getElementById('add-contact-btn').addEventListener('click', () => this._openContactModal());
    document.getElementById('contact-search').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this._renderContacts();
    });
  }

  _openContactModal(editId = null) {
    const contact = editId ? this.store.getContacts().find(c => c.id === editId) : null;
    const title = contact ? 'Edit Contact' : 'Add New Contact';

    const content = `
      <div class="form-group">
        <label class="form-label">Name *</label>
        <input type="text" class="form-input" id="contact-name" value="${contact ? contact.name : ''}" placeholder="Full name..." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Role / Title</label>
          <input type="text" class="form-input" id="contact-role" value="${contact ? contact.role || '' : ''}" placeholder="e.g. Engineer" />
        </div>
        <div class="form-group">
          <label class="form-label">Company</label>
          <input type="text" class="form-input" id="contact-company" value="${contact ? contact.company || '' : ''}" placeholder="e.g. Neer" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="contact-email" value="${contact ? contact.email || '' : ''}" placeholder="email@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input type="tel" class="form-input" id="contact-phone" value="${contact ? contact.phone || '' : ''}" placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tags (comma-separated)</label>
        <input type="text" class="form-input" id="contact-tags" value="${contact && contact.tags ? contact.tags.join(', ') : ''}" placeholder="e.g. Team, Vendor, Client" />
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" id="contact-notes" placeholder="Notes...">${contact ? contact.notes || '' : ''}</textarea>
      </div>
    `;

    Modal.open({
      title,
      content,
      onSave: (close) => {
        const name = document.getElementById('contact-name').value.trim();
        if (!name) { Toast.show('Name is required', 'error'); return; }

        const data = {
          name,
          role: document.getElementById('contact-role').value.trim(),
          company: document.getElementById('contact-company').value.trim(),
          email: document.getElementById('contact-email').value.trim(),
          phone: document.getElementById('contact-phone').value.trim(),
          tags: document.getElementById('contact-tags').value.split(',').map(t => t.trim()).filter(Boolean),
          notes: document.getElementById('contact-notes').value.trim(),
        };

        if (contact) {
          this.store.updateContact(contact.id, data);
          Toast.show('Contact updated', 'success');
        } else {
          this.store.addContact(data);
          Toast.show('Contact added', 'success');
        }
        close();
        this._renderContacts();
      },
      onDelete: contact ? (close) => {
        this.store.deleteContact(contact.id);
        Toast.show('Contact deleted', 'success');
        close();
        this._renderContacts();
      } : null,
    });
  }

  _getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
