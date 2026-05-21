/**
 * Seed Script — Loads initial Neer project data into the database.
 * Run once after first deploy: node server/seed.js
 * Safe to run multiple times — only seeds if database is empty.
 */
import { initDB, readDB, writeDB } from './db.js';

const SEED_DATA = {
  tasks: [
    { id: "t1", title: "Restore Material roll out", category: "Neer", priority: "high", status: "in-progress", dueDate: "2026-05-23", description: "Roll out the Restore material across production.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t2", title: "New flexible material for Moment", category: "Moment", priority: "high", status: "in-progress", dueDate: "2026-05-23", description: "Evaluate and integrate the new flexible material for Moment products.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t3", title: "Learn the Restore Material → SOP the polish", category: "Manufacturing", priority: "high", status: "todo", dueDate: "2026-05-23", description: "Learn the Restore material process and create SOP for polishing.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t4", title: "Learn the polish → SOP the polish", category: "Manufacturing", priority: "high", status: "todo", dueDate: "2026-05-23", description: "Master the polishing technique and document the SOP.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t5", title: "Meet Ayush — figure out fitment issues", category: "Neer", priority: "high", status: "todo", dueDate: "2026-05-21", description: "Meet with Ayush to diagnose and resolve current fitment issues.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t6", title: "New Mesh repair (Sina + Ayush)", category: "Design", priority: "high", status: "todo", dueDate: "2026-05-23", description: "Work with Sina and Ayush on the new mesh repair approach.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t7", title: "Connect with Moonsmile — Fix mesh issue", category: "Design", priority: "high", status: "todo", dueDate: "2026-05-23", description: "Reach out to Moonsmile team to resolve the mesh issue.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t8", title: "New portal development", category: "Design", priority: "medium", status: "todo", dueDate: "2026-05-30", description: "Start development on the new portal improvements.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t9", title: "Moment material is weak", category: "Moment", priority: "high", status: "todo", dueDate: "", description: "Current Moment material strength is insufficient.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t10", title: "Shade/translucency doesn't match Neers", category: "Moment", priority: "high", status: "todo", dueDate: "", description: "Moment shade and translucency not matching Neer products.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t11", title: "Bleach shade too opaque (new material)", category: "Moment", priority: "high", status: "todo", dueDate: "", description: "Bleach shade on the new material is too opaque.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t12", title: "Roll out new Moment material", category: "Moment", priority: "high", status: "in-progress", dueDate: "2026-06-01", description: "New Moment material needs production rollout.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t13", title: "Lab turnaround too slow (10 days)", category: "Neer", priority: "high", status: "todo", dueDate: "", description: "Current lab has 10-day turnaround time.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t14", title: "Glaze wears off ~1 year — no reglaze solution", category: "Neer", priority: "high", status: "todo", dueDate: "", description: "Glaze wears off around the 1-year mark. No reglazing solution exists.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t15", title: "Accelerated wear (whitening, caffeine, etc.)", category: "Neer", priority: "medium", status: "todo", dueDate: "", description: "Glaze shows accelerated wear from whitening strips, toothpaste, caffeine, alcohol, chili.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t16", title: "New material RED — evaluate", category: "Neer", priority: "medium", status: "todo", dueDate: "", description: "New material RED on the horizon. Needs evaluation.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t17", title: "Moving files & nesting are inefficient", category: "Manufacturing", priority: "medium", status: "todo", dueDate: "", description: "File moving and nesting workflows are very inefficient.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t18", title: "SKDLA for NEERs pending (new material)", category: "Manufacturing", priority: "high", status: "todo", dueDate: "", description: "SKDLA process for NEERs still pending — tied to new material.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t19", title: "China design team nesting — needs SOP", category: "Manufacturing", priority: "medium", status: "todo", dueDate: "", description: "China team needs to nest everything. Create SOP.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t20", title: "New packaging", category: "Commercial", priority: "medium", status: "todo", dueDate: "2026-06-18", description: "New packaging design. ~30 days out.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t21", title: "Scanning hub", category: "Commercial", priority: "medium", status: "todo", dueDate: "", description: "Set up scanning hub infrastructure.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t22", title: "Guidelines — DOs and DON'Ts", category: "Commercial", priority: "medium", status: "todo", dueDate: "", description: "Create product guidelines documentation.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t23", title: "Moment Setting Paste (30-60 days out)", category: "Commercial", priority: "low", status: "todo", dueDate: "2026-07-18", description: "Setting paste — 30-60 days out. 8 hours hold.", createdAt: "2026-05-18T00:00:00Z" },
    { id: "t24", title: "Shade guide", category: "Other", priority: "low", status: "todo", dueDate: "", description: "Create/update the shade guide.", createdAt: "2026-05-18T00:00:00Z" },
  ],
  contacts: [],
  meetings: [],
  issues: [],
  ganttItems: [
    { id: "g1", title: "New Moment Material Rollout", category: "Moment", startDate: "2026-05-18", endDate: "2026-06-01", progress: 30, status: "in-progress", createdAt: "2026-05-18T00:00:00Z" },
    { id: "g2", title: "New Packaging", category: "Commercial", startDate: "2026-05-18", endDate: "2026-06-18", progress: 5, status: "not-started", createdAt: "2026-05-18T00:00:00Z" },
    { id: "g3", title: "Moment Setting Paste", category: "Commercial", startDate: "2026-05-18", endDate: "2026-07-18", progress: 0, status: "not-started", createdAt: "2026-05-18T00:00:00Z" },
    { id: "g4", title: "Restore Material Rollout", category: "Neer", startDate: "2026-05-18", endDate: "2026-05-30", progress: 50, status: "in-progress", createdAt: "2026-05-18T00:00:00Z" },
    { id: "g5", title: "SKDLA for NEERs (new mat.)", category: "Manufacturing", startDate: "2026-05-18", endDate: "2026-06-30", progress: 0, status: "not-started", createdAt: "2026-05-18T00:00:00Z" },
    { id: "g6", title: "China Nesting SOP", category: "Manufacturing", startDate: "2026-05-18", endDate: "2026-06-15", progress: 0, status: "not-started", createdAt: "2026-05-18T00:00:00Z" },
    { id: "g7", title: "Portal Improvements", category: "Design", startDate: "2026-05-18", endDate: "2026-06-30", progress: 15, status: "in-progress", createdAt: "2026-05-18T00:00:00Z" },
    { id: "g8", title: "Moment to Consumers Push", category: "Commercial", startDate: "2026-05-18", endDate: "2026-07-01", progress: 10, status: "in-progress", createdAt: "2026-05-18T00:00:00Z" },
  ],
  categories: [
    { id: "cat1", name: "Moment", color: "#ec4899", icon: "🔵" },
    { id: "cat2", name: "Neer", color: "#34d399", icon: "🟢" },
    { id: "cat3", name: "Design", color: "#a78bfa", icon: "🎨" },
    { id: "cat4", name: "Manufacturing", color: "#f59e0b", icon: "🏭" },
    { id: "cat5", name: "Commercial", color: "#60a5fa", icon: "📈" },
    { id: "cat6", name: "Other", color: "#94a3b8", icon: "📋" },
  ],
};

async function seed() {
  await initDB();
  const db = await readDB();

  if (db.tasks && db.tasks.length > 0) {
    console.log('Database already has data. Skipping seed.');
    process.exit(0);
  }

  console.log('Seeding database with initial Neer project data...');
  await writeDB(SEED_DATA);
  console.log('✅ Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
