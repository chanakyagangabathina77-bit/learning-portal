import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PORT = Number(process.env.PORT || 8787);

const DEFAULT_DB = {
  users: [],
  sessions: {},
  portals: {},
};

async function loadDb() {
  await ensureDbFile();
  const raw = await readFile(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

async function saveDb(db) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

async function ensureDbFile() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }

  if (!existsSync(DB_FILE)) {
    await saveDb(DEFAULT_DB);
  }
}

function json(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  });
  res.end(body);
}

function text(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const candidate = pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  const actual = Buffer.from(hash, 'hex');
  if (candidate.length !== actual.length) return false;
  return timingSafeEqual(candidate, actual);
}

function signToken() {
  return randomBytes(24).toString('hex');
}

function getAuthToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function getSessionUser(db, req) {
  const token = getAuthToken(req);
  if (!token) return null;

  const userId = db.sessions[token];
  if (!userId) return null;

  return db.users.find((user) => user.id === userId) || null;
}

function makePortalDefaults(email, name) {
  return {
    studentName: name || email.split('@')[0],
    activeVideoId: 'lesson-01',
    bookmarks: [],
    progress: {},
    quizzes: {},
    quizDrafts: {},
  };
}

function redactUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      return text(res, 204, '');
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const db = await loadDb();

    if (req.method === 'POST' && url.pathname === '/api/auth/signup') {
      const body = await readBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      const name = String(body.name || '').trim();

      if (!email || !password || !name) {
        return json(res, 400, { error: 'Name, email, and password are required.' });
      }

      if (db.users.some((user) => user.email === email)) {
        return json(res, 409, { error: 'An account with this email already exists.' });
      }

      const id = randomBytes(12).toString('hex');
      const { salt, hash } = hashPassword(password);
      const user = { id, email, name, passwordSalt: salt, passwordHash: hash };
      const token = signToken();

      db.users.push(user);
      db.sessions[token] = user.id;
      db.portals[user.id] = makePortalDefaults(email, name);
      await saveDb(db);

      return json(res, 200, {
        token,
        user: redactUser(user),
        portal: db.portals[user.id],
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');

      const user = db.users.find((entry) => entry.email === email);
      if (!user) {
        return json(res, 401, { error: 'Invalid email or password.' });
      }

      if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
        return json(res, 401, { error: 'Invalid email or password.' });
      }

      const token = signToken();
      db.sessions[token] = user.id;
      if (!db.portals[user.id]) {
        db.portals[user.id] = makePortalDefaults(user.email, user.name);
      }
      await saveDb(db);

      return json(res, 200, {
        token,
        user: redactUser(user),
        portal: db.portals[user.id],
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      const token = getAuthToken(req);
      if (token && db.sessions[token]) {
        delete db.sessions[token];
        await saveDb(db);
      }
      return json(res, 200, { ok: true });
    }

    const user = await getSessionUser(db, req);
    if (!user) {
      return json(res, 401, { error: 'Unauthorized' });
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      return json(res, 200, {
        user: redactUser(user),
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/portal') {
      return json(res, 200, {
        user: redactUser(user),
        portal: db.portals[user.id] || makePortalDefaults(user.email, user.name),
      });
    }

    if (req.method === 'PUT' && url.pathname === '/api/profile') {
      const body = await readBody(req);
      const name = String(body.name || '').trim() || user.name || user.email.split('@')[0];

      user.name = name;
      db.portals[user.id] = {
        ...(db.portals[user.id] || makePortalDefaults(user.email, name)),
        studentName: name,
      };
      await saveDb(db);

      return json(res, 200, {
        user: redactUser(user),
        portal: db.portals[user.id],
      });
    }

    if (req.method === 'PUT' && url.pathname === '/api/portal') {
      const body = await readBody(req);
      const current = db.portals[user.id] || makePortalDefaults(user.email, user.name);
      db.portals[user.id] = {
        ...current,
        ...body,
      };
      await saveDb(db);
      return json(res, 200, {
        portal: db.portals[user.id],
      });
    }

    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
