/**
 * SettingsView — App settings: category management, data export/import, theme.
 */
import { Modal } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';

export class SettingsView {
  constructor(store) {
    this.store = store;
    this.el = document.getElementById('view-settings');
  }

  render() {
    const categories = this.store.getCategories();

    this.el.innerHTML = `
      <div class="view-header">
        <div>
          <h1>Settings</h1>
          <p class="view-subtitle">Manage your app preferences and data.</p>
        </div>
      </div>

      <div class="settings-sections">
        <!-- Categories -->
        <div class="settings-section">
          <div class="settings-section-header">
            <h3 class="settings-section-title">Workstream Categories</h3>
            <button class="btn btn-secondary btn-sm" id="add-category-btn">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          </div>
          <p class="settings-section-desc">These categories are used in Tasks, Gantt Chart, and across the app.</p>
          <div class="category-list" id="category-list">
            ${categories.map(c => `
              <div class="category-item">
                <div class="category-color" style="background:${c.color}"></div>
                <span class="category-name">${c.icon || ''} ${c.name}</span>
                <div class="category-actions">
                  <button class="task-action-btn edit" data-edit-cat="${c.id}" title="Edit">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="task-action-btn delete" data-delete-cat="${c.id}" title="Delete">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Data Management -->
        <div class="settings-section">
          <h3 class="settings-section-title" style="margin-bottom:var(--space-3);">Data Management</h3>
          <p class="settings-section-desc">Export your data as a backup file, or import from a previous backup.</p>
          <div class="data-actions">
            <div class="data-action-card" id="export-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <h4>Export Data</h4>
              <p>Download all your data as a JSON file</p>
            </div>
            <div class="data-action-card" id="import-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <h4>Import Data</h4>
              <p>Restore from a JSON backup file</p>
            </div>
          </div>
          <input type="file" id="import-file-input" accept=".json" style="display:none;" />
        </div>

        <!-- Danger Zone -->
        <div class="settings-section" style="border-color:rgba(248,113,113,0.3);">
          <h3 class="settings-section-title" style="color:var(--color-danger);margin-bottom:var(--space-3);">Danger Zone</h3>
          <p class="settings-section-desc">Permanently delete all data. This cannot be undone.</p>
          <button class="btn btn-danger" id="clear-all-btn">Clear All Data</button>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // Category actions
    this.el.querySelectorAll('[data-edit-cat]').forEach(el => {
      el.addEventListener('click', () => this._openCategoryModal(el.dataset.editCat));
    });

    this.el.querySelectorAll('[data-delete-cat]').forEach(el => {
      el.addEventListener('click', () => {
        this.store.deleteCategory(el.dataset.deleteCat);
        Toast.show('Category deleted', 'success');
        this.render();
      });
    });

    document.getElementById('add-category-btn').addEventListener('click', () => this._openCategoryModal());

    // Export
    document.getElementById('export-btn').addEventListener('click', () => {
      this.store.exportData();
      Toast.show('Data exported successfully', 'success');
    });

    // Import
    const importInput = document.getElementById('import-file-input');
    document.getElementById('import-btn').addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = this.store.importData(ev.target.result);
        if (success) {
          Toast.show('Data imported successfully', 'success');
          this.render();
        } else {
          Toast.show('Failed to import — invalid file', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Clear all
    document.getElementById('clear-all-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
        this.store.clearAll();
        Toast.show('All data cleared', 'success');
        this.render();
      }
    });
  }

  _openCategoryModal(editId = null) {
    const cat = editId ? this.store.getCategories().find(c => c.id === editId) : null;
    const title = cat ? 'Edit Category' : 'Add New Category';

    const content = `
      <div class="form-group">
        <label class="form-label">Name *</label>
        <input type="text" class="form-input" id="cat-name" value="${cat ? cat.name : ''}" placeholder="Category name..." />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Color</label>
          <input type="color" class="form-input" id="cat-color" value="${cat ? cat.color : '#ec4899'}" style="padding:4px;height:42px;" />
        </div>
        <div class="form-group">
          <label class="form-label">Icon (emoji)</label>
          <input type="text" class="form-input" id="cat-icon" value="${cat ? cat.icon || '' : ''}" placeholder="📋" maxlength="4" />
        </div>
      </div>
    `;

    Modal.open({
      title,
      content,
      onSave: (close) => {
        const name = document.getElementById('cat-name').value.trim();
        if (!name) { Toast.show('Name is required', 'error'); return; }

        const data = {
          name,
          color: document.getElementById('cat-color').value,
          icon: document.getElementById('cat-icon').value.trim(),
        };

        if (cat) {
          this.store.updateCategory(cat.id, data);
          Toast.show('Category updated', 'success');
        } else {
          this.store.addCategory(data);
          Toast.show('Category added', 'success');
        }
        close();
        this.render();
      },
      onDelete: cat ? (close) => {
        this.store.deleteCategory(cat.id);
        Toast.show('Category deleted', 'success');
        close();
        this.render();
      } : null,
    });
  }
}
