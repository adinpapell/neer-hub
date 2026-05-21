/**
 * API Routes — Express router for all CRUD endpoints.
 * All operations are async to support both PostgreSQL and local file.
 */
import { Router } from 'express';
import {
  readDB, writeDB, getCollection, addItem,
  updateItem, deleteItem, getLastModified
} from './db.js';

const router = Router();

/* ── Change Detection ── */
router.get('/api/last-modified', async (req, res) => {
  const ts = await getLastModified();
  res.json({ lastModified: ts });
});

/* ── Full Data (for initial load & polling) ── */
router.get('/api/data', async (req, res) => {
  const data = await readDB();
  res.json(data);
});

/* ── Import / Export ── */
router.post('/api/import', async (req, res) => {
  try {
    const data = req.body;
    await writeDB({
      tasks:      data.tasks || [],
      contacts:   data.contacts || [],
      meetings:   data.meetings || [],
      ganttItems: data.ganttItems || [],
      categories: data.categories || [],
      issues:     data.issues || [],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

router.post('/api/clear', async (req, res) => {
  await writeDB({
    tasks: [], contacts: [], meetings: [],
    ganttItems: [], categories: [], issues: [],
  });
  res.json({ success: true });
});

/* ── Generic CRUD factory ── */
const collections = ['tasks', 'contacts', 'meetings', 'ganttItems', 'categories', 'issues'];

collections.forEach(name => {
  router.get(`/api/${name}`, async (req, res) => {
    const items = await getCollection(name);
    res.json(items);
  });

  router.post(`/api/${name}`, async (req, res) => {
    const item = await addItem(name, req.body);
    res.status(201).json(item);
  });

  router.put(`/api/${name}/:id`, async (req, res) => {
    const updated = await updateItem(name, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  });

  router.delete(`/api/${name}/:id`, async (req, res) => {
    const deleted = await deleteItem(name, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

export default router;
