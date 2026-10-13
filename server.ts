import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_USERS } from './src/data/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Storage directory for uploads & db persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// In-memory / persistent database structure
interface DatabaseState {
  users: any[];
  clients: any[];
  leads: any[];
  works: any[];
  services: any[];
  reimbursements: any[];
  attendance: any[];
  siteVisits: any[];
  employeeDocuments: any[];
  materialRequests: any[];
  companyProfile: any;
  festivals: any[];
  notifications: any[];
  tombstones: any[];
  updatedAt: string;
}

function loadDatabase(): DatabaseState {
  let loaded: DatabaseState = {
    users: [],
    clients: [],
    leads: [],
    works: [],
    services: [],
    reimbursements: [],
    attendance: [],
    siteVisits: [],
    employeeDocuments: [],
    materialRequests: [],
    companyProfile: null,
    festivals: [],
    notifications: [],
    tombstones: [],
    updatedAt: new Date().toISOString()
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      loaded = JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading db.json:', e);
  }

  // Ensure db.users contains all 43 staff members from INITIAL_USERS
  const serverUsersMap = new Map((loaded.users || []).map((u: any) => [u.id, u]));
  const mergedUsers: any[] = INITIAL_USERS.map((initUser) => {
    const serverUser = serverUsersMap.get(initUser.id);
    if (!serverUser) return initUser;
    return {
      ...initUser,
      ...serverUser,
      phone: initUser.phone || serverUser.phone || '',
      department: serverUser.department || initUser.department,
      designation: serverUser.designation || initUser.designation,
      reportingTo: serverUser.reportingTo || initUser.reportingTo,
      emergencyPhone: serverUser.emergencyPhone || initUser.emergencyPhone,
      emergencyRelation: serverUser.emergencyRelation || initUser.emergencyRelation,
      employeeCode: serverUser.employeeCode || initUser.employeeCode,
      joiningDate: serverUser.joiningDate || initUser.joiningDate,
      dateOfBirth: serverUser.dateOfBirth || initUser.dateOfBirth,
      salaryDetails: serverUser.salaryDetails || initUser.salaryDetails
    };
  });

  const initIds = new Set(INITIAL_USERS.map((u) => u.id));
  (loaded.users || []).forEach((su: any) => {
    if (!initIds.has(su.id)) {
      mergedUsers.push(su);
    }
  });

  loaded.users = mergedUsers;
  return loaded;
}

let db = loadDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db.json:', e);
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), entityCount: {
    users: db.users.length,
    attendance: db.attendance.length,
    siteVisits: db.siteVisits.length
  }});
});

// Full Sync Pull
app.get('/api/sync', (req, res) => {
  res.json(db);
});

// Full Sync Push / Merging
app.post('/api/sync', (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: 'No data provided' });
  }

  // Update tombstones
  if (Array.isArray(body.tombstones)) {
    const existingIds = new Set(db.tombstones.map((t: any) => `${t.entity}:${t.id}`));
    body.tombstones.forEach((t: any) => {
      if (!existingIds.has(`${t.entity}:${t.id}`)) {
        db.tombstones.push(t);
      }
    });
  }

  const deletedUserIds = new Set(db.tombstones.filter((t: any) => t.entity === 'users').map((t: any) => t.id));

  // Merge users (excluding tombstones)
  if (Array.isArray(body.users) && body.users.length > 0) {
    db.users = body.users.filter((u: any) => !deletedUserIds.has(u.id));
  }

  if (Array.isArray(body.clients)) db.clients = body.clients;
  if (Array.isArray(body.leads)) db.leads = body.leads;
  if (Array.isArray(body.works)) db.works = body.works;
  if (Array.isArray(body.services)) db.services = body.services;
  if (Array.isArray(body.reimbursements)) db.reimbursements = body.reimbursements;
  if (Array.isArray(body.attendance)) db.attendance = body.attendance;
  if (Array.isArray(body.siteVisits)) db.siteVisits = body.siteVisits;
  if (Array.isArray(body.employeeDocuments)) db.employeeDocuments = body.employeeDocuments;
  if (Array.isArray(body.materialRequests)) db.materialRequests = body.materialRequests;
  if (body.companyProfile) db.companyProfile = body.companyProfile;
  if (Array.isArray(body.festivals)) db.festivals = body.festivals;
  if (Array.isArray(body.notifications)) db.notifications = body.notifications;

  db.updatedAt = new Date().toISOString();
  saveDatabase();
  res.json({ success: true, updatedAt: db.updatedAt });
});

// Storage Upload Endpoint (for watermarked photos and employee documents)
app.post('/api/storage/upload', (req, res) => {
  try {
    const { fileData, fileName, category } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'fileData is required' });
    }

    if (fileData.startsWith('data:')) {
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1] || 'jpg';
        const safeName = `${category || 'file'}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, safeName);
        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(filePath, buffer);
        return res.json({ url: `/uploads/${safeName}`, fileName: safeName });
      }
    }

    res.json({ url: fileData, fileName: fileName || 'file' });
  } catch (err: any) {
    console.error('Upload handling error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// Start Server with Vite Middleware
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KDPL Enterprise Portal Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
