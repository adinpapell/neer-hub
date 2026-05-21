/**
 * Neer Hub — Main Application Entry Point.
 * Initializes store (connects to API), seeds data on first run,
 * sets up routing, and renders the active view.
 * Listens for live updates from other users via polling.
 */
import './css/variables.css';
import './css/base.css';
import './css/sidebar.css';
import './css/components.css';
import './css/dashboard.css';
import './css/tasks.css';
import './css/contacts.css';
import './css/meetings.css';
import './css/gantt.css';
import './css/issues.css';
import './css/settings.css';

import { Store } from './js/store.js';
import { seedStore } from './js/seedData.js';
import { DashboardView } from './js/views/DashboardView.js';
import { TasksView } from './js/views/TasksView.js';
import { ContactsView } from './js/views/ContactsView.js';
import { MeetingsView } from './js/views/MeetingsView.js';
import { GanttView } from './js/views/GanttView.js';
import { IssuesView } from './js/views/IssuesView.js';
import { SettingsView } from './js/views/SettingsView.js';

class NeerHub {
  constructor() {
    this.store = new Store();
    this.currentView = 'dashboard';
    this.views = {};
    this._booted = false;
  }

  async boot() {
    if (this._booted) return;
    this._booted = true;

    // Connect to server and load data
    await this.store.init();

    // Seed on first launch (if server has no data)
    await seedStore(this.store);

    // Re-fetch after seeding to have all IDs
    await this.store.init();

    // Create views
    this.views = {
      dashboard: new DashboardView(this.store),
      tasks:     new TasksView(this.store),
      contacts:  new ContactsView(this.store),
      meetings:  new MeetingsView(this.store),
      gantt:     new GanttView(this.store),
      issues:    new IssuesView(this.store),
      settings:  new SettingsView(this.store),
    };

    // Set up navigation
    this._setupNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', () => this._onHashChange());

    // Listen for live updates — re-render current view
    this.store.on('*', () => {
      if (this.views[this.currentView]) {
        this.views[this.currentView].render();
      }
    });

    // Initial render
    this._onHashChange();
  }

  _setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        if (view) this.navigate(view);
      });
    });
  }

  navigate(viewName) {
    if (!this.views[viewName]) return;
    window.location.hash = viewName;
  }

  _onHashChange() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (!this.views[hash]) return;

    this.currentView = hash;

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === hash);
    });

    // Show/hide views
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    const viewEl = document.getElementById(`view-${hash}`);
    if (viewEl) viewEl.classList.add('active');

    // Render the active view
    this.views[hash].render();
  }
}

// Boot the app
const app = new NeerHub();

function startApp() {
  app.boot().catch(err => {
    console.error('Failed to boot Neer Hub:', err);
    document.getElementById('view-dashboard').innerHTML = `
      <div class="empty-state" style="height:60vh;">
        <h3 style="color:var(--color-danger);">Cannot connect to server</h3>
        <p>Make sure the Neer Hub server is running.<br>
        Run <code style="color:var(--accent);">npm start</code> in the terminal.</p>
      </div>`;
    document.getElementById('view-dashboard').classList.add('active');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
