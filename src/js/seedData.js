/**
 * Seed Data — Pre-loaded tasks, issues, gantt items, and categories
 * from the Neer project Google Doc.
 * Now seeds via API calls to the shared server.
 */

export const SEED_CATEGORIES = [
  { name: 'Moment',        color: '#ec4899', icon: '🔵' },
  { name: 'Neer',          color: '#34d399', icon: '🟢' },
  { name: 'Design',        color: '#a78bfa', icon: '🎨' },
  { name: 'Manufacturing', color: '#f59e0b', icon: '🏭' },
  { name: 'Commercial',    color: '#60a5fa', icon: '📈' },
  { name: 'Other',         color: '#94a3b8', icon: '📋' },
];

export const SEED_TASKS = [
  // Week of May 18th — Active tasks
  { title: 'Restore Material roll out',                   category: 'Neer',          priority: 'high',   status: 'in-progress', dueDate: '2026-05-23', description: 'Roll out the Restore material across production.' },
  { title: 'New flexible material for Moment',            category: 'Moment',        priority: 'high',   status: 'in-progress', dueDate: '2026-05-23', description: 'Evaluate and integrate the new flexible material for Moment products.' },
  { title: 'Learn the Restore Material → SOP the polish', category: 'Manufacturing', priority: 'high',   status: 'todo',        dueDate: '2026-05-23', description: 'Learn the Restore material process and create SOP for polishing.' },
  { title: 'Learn the polish → SOP the polish',           category: 'Manufacturing', priority: 'high',   status: 'todo',        dueDate: '2026-05-23', description: 'Master the polishing technique and document the SOP.' },
  { title: 'Meet Ayush — figure out fitment issues',      category: 'Neer',          priority: 'high',   status: 'todo',        dueDate: '2026-05-21', description: 'Meet with Ayush to diagnose and resolve current fitment issues.' },
  { title: 'New Mesh repair (Sina + Ayush)',               category: 'Design',        priority: 'high',   status: 'todo',        dueDate: '2026-05-23', description: 'Work with Sina and Ayush on the new mesh repair approach.' },
  { title: 'Connect with Moonsmile — Fix mesh issue',     category: 'Design',        priority: 'high',   status: 'todo',        dueDate: '2026-05-23', description: 'Reach out to Moonsmile team to resolve the mesh issue.' },
  { title: 'New portal development',                      category: 'Design',        priority: 'medium', status: 'todo',        dueDate: '2026-05-30', description: 'Start development on the new portal improvements.' },

  // Ongoing issues — Moment
  { title: 'Moment material is weak',                     category: 'Moment',  priority: 'high',   status: 'todo', dueDate: '', description: 'Current Moment material strength is insufficient.' },
  { title: 'Shade/translucency doesn\'t match Neers',     category: 'Moment',  priority: 'high',   status: 'todo', dueDate: '', description: 'Moment shade and translucency not matching Neer products.' },
  { title: 'Bleach shade too opaque (new material)',       category: 'Moment',  priority: 'high',   status: 'todo', dueDate: '', description: 'Bleach shade on the new material is too opaque.' },
  { title: 'Roll out new Moment material',                category: 'Moment',  priority: 'high',   status: 'in-progress', dueDate: '2026-06-01', description: 'New Moment material needs production rollout.' },

  // Ongoing issues — Neer
  { title: 'Lab turnaround too slow (10 days)',            category: 'Neer', priority: 'high',   status: 'todo', dueDate: '', description: 'Current lab has 10-day turnaround time.' },
  { title: 'Glaze wears off ~1 year — no reglaze solution',category: 'Neer', priority: 'high',  status: 'todo', dueDate: '', description: 'Glaze wears off around the 1-year mark. No reglazing solution exists.' },
  { title: 'Accelerated wear (whitening, caffeine, etc.)', category: 'Neer', priority: 'medium', status: 'todo', dueDate: '', description: 'Glaze shows accelerated wear from whitening strips, toothpaste, caffeine, alcohol, chili.' },
  { title: 'New material "RED" — evaluate',                category: 'Neer', priority: 'medium', status: 'todo', dueDate: '', description: 'New material RED on the horizon. Needs evaluation.' },

  // Manufacturing
  { title: 'Moving files & nesting are inefficient',       category: 'Manufacturing', priority: 'medium', status: 'todo', dueDate: '', description: 'File moving and nesting workflows are very inefficient.' },
  { title: 'SKDLA for NEERs pending (new material)',       category: 'Manufacturing', priority: 'high',   status: 'todo', dueDate: '', description: 'SKDLA process for NEERs still pending — tied to new material.' },
  { title: 'China design team nesting — needs SOP',        category: 'Manufacturing', priority: 'medium', status: 'todo', dueDate: '', description: 'China team needs to nest everything. Create SOP.' },

  // Commercial
  { title: 'New packaging',                                category: 'Commercial', priority: 'medium', status: 'todo',        dueDate: '2026-06-18', description: 'New packaging design. ~30 days out.' },
  { title: 'Scanning hub',                                 category: 'Commercial', priority: 'medium', status: 'todo',        dueDate: '', description: 'Set up scanning hub infrastructure.' },
  { title: 'Guidelines — DOs and DON\'Ts',                 category: 'Commercial', priority: 'medium', status: 'todo',        dueDate: '', description: 'Create product guidelines documentation.' },
  { title: 'Moment Setting Paste (30-60 days out)',        category: 'Commercial', priority: 'low',    status: 'todo',        dueDate: '2026-07-18', description: 'Setting paste — 30-60 days out. 8 hours hold.' },

  // Other
  { title: 'Shade guide',                                  category: 'Other', priority: 'low', status: 'todo', dueDate: '', description: 'Create/update the shade guide.' },
];

export const SEED_GANTT_ITEMS = [
  { title: 'New Moment Material Rollout',  category: 'Moment',        startDate: '2026-05-18', endDate: '2026-06-01', progress: 30,  status: 'in-progress' },
  { title: 'New Packaging',                category: 'Commercial',    startDate: '2026-05-18', endDate: '2026-06-18', progress: 5,   status: 'not-started' },
  { title: 'Moment Setting Paste',         category: 'Commercial',    startDate: '2026-05-18', endDate: '2026-07-18', progress: 0,   status: 'not-started' },
  { title: 'Restore Material Rollout',     category: 'Neer',          startDate: '2026-05-18', endDate: '2026-05-30', progress: 50,  status: 'in-progress' },
  { title: 'SKDLA for NEERs (new mat.)',   category: 'Manufacturing', startDate: '2026-05-18', endDate: '2026-06-30', progress: 0,   status: 'not-started' },
  { title: 'China Nesting SOP',            category: 'Manufacturing', startDate: '2026-05-18', endDate: '2026-06-15', progress: 0,   status: 'not-started' },
  { title: 'Portal Improvements',          category: 'Design',        startDate: '2026-05-18', endDate: '2026-06-30', progress: 15,  status: 'in-progress' },
  { title: 'Moment to Consumers Push',     category: 'Commercial',    startDate: '2026-05-18', endDate: '2026-07-01', progress: 10,  status: 'in-progress' },
];

/**
 * Seeds the store with initial data if it's empty.
 * Only runs on first launch — won't overwrite existing data.
 */
export async function seedStore(store) {
  if (store.getCategories().length === 0) {
    for (const cat of SEED_CATEGORIES) {
      await store.addCategory(cat);
    }
  }
  if (store.getTasks().length === 0) {
    for (const task of SEED_TASKS) {
      await store.addTask(task);
    }
  }
  if (store.getGanttItems().length === 0) {
    for (const item of SEED_GANTT_ITEMS) {
      await store.addGanttItem(item);
    }
  }
}
