const path = require('path');
const fs = require('fs');
require('dotenv').config();

let db;

// Try to initialize Firebase; fall back to local JSON on any failure
let firebaseOk = false;
try {
  const admin = require('firebase-admin');
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './firebase-service-account.json';
  const resolvedServiceAccountPath = path.resolve(serviceAccountPath);
  const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON || fs.existsSync(resolvedServiceAccountPath);

  if (hasServiceAccount) {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      serviceAccount = require(resolvedServiceAccountPath);
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }

    db = admin.firestore();
    console.log('Firebase Firestore initialized');
    firebaseOk = true;
  }
} catch (e) {
  console.error('Firebase init failed, using local JSON fallback:', e.message);
}

if (!firebaseOk) {
  console.log('Using local JSON database fallback.');

  const DATA_DIR = process.env.VERCEL ? '/tmp/genesis-data' : path.join(__dirname, '..', 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  function readCollection(name) {
    const file = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(file)) return [];
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      return [];
    }
  }

  function writeCollection(name, data) {
    const file = path.join(DATA_DIR, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  }

  class LocalFirestore {
    collection(name) {
      return new LocalCollection(name);
    }
    batch() {
      return new LocalBatch();
    }
  }

  class LocalCollection {
    constructor(name, queries = [], limitVal = null, orderByVal = null) {
      this.name = name;
      this.queries = queries;
      this.limitVal = limitVal;
      this.orderByVal = orderByVal;
    }

    where(field, op, value) {
      return new LocalCollection(
        this.name,
        [...this.queries, { field, op, value }],
        this.limitVal,
        this.orderByVal
      );
    }

    limit(n) {
      return new LocalCollection(this.name, this.queries, n, this.orderByVal);
    }

    orderBy(field, direction = 'asc') {
      return new LocalCollection(this.name, this.queries, this.limitVal, { field, direction });
    }

    doc(id) {
      return new LocalDocumentReference(this.name, id);
    }

    async add(data) {
      const docs = readCollection(this.name);
      const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const newDoc = { id, ...data };
      docs.push(newDoc);
      writeCollection(this.name, docs);
      return new LocalDocumentReference(this.name, id);
    }

    async get() {
      let docs = readCollection(this.name);

      for (const q of this.queries) {
        docs = docs.filter(d => {
          const val = d[q.field];
          if (q.op === '==') return val === q.value;
          if (q.op === '!=') return val !== q.value;
          if (q.op === '>') return val > q.value;
          if (q.op === '>=') return val >= q.value;
          if (q.op === '<') return val < q.value;
          if (q.op === '<=') return val <= q.value;
          if (q.op === 'array-contains') return Array.isArray(val) && val.includes(q.value);
          if (q.op === 'in') return Array.isArray(q.value) && q.value.includes(val);
          return false;
        });
      }

      if (this.orderByVal) {
        const { field, direction } = this.orderByVal;
        docs.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          if (valA < valB) return direction === 'desc' ? 1 : -1;
          if (valA > valB) return direction === 'desc' ? -1 : 1;
          return 0;
        });
      }

      if (this.limitVal !== null) {
        docs = docs.slice(0, this.limitVal);
      }

      const docSnapshots = docs.map(d => {
        const { id, ...data } = d;
        return new LocalDocumentSnapshot(id, data, true, this.name);
      });

      return new LocalQuerySnapshot(docSnapshots);
    }
  }

  class LocalDocumentReference {
    constructor(collectionName, id) {
      this.collectionName = collectionName;
      this.id = id;
    }

    async get() {
      const docs = readCollection(this.collectionName);
      const found = docs.find(d => d.id === this.id);
      if (!found) {
        return new LocalDocumentSnapshot(this.id, null, false, this.collectionName);
      }
      const { id, ...data } = found;
      return new LocalDocumentSnapshot(this.id, data, true, this.collectionName);
    }

    async update(updates) {
      const docs = readCollection(this.collectionName);
      const index = docs.findIndex(d => d.id === this.id);
      if (index === -1) {
        throw new Error(`Document not found: ${this.id}`);
      }
      docs[index] = { ...docs[index], ...updates };
      writeCollection(this.collectionName, docs);
    }

    async set(data) {
      const docs = readCollection(this.collectionName);
      const index = docs.findIndex(d => d.id === this.id);
      if (index === -1) {
        docs.push({ id: this.id, ...data });
      } else {
        docs[index] = { id: this.id, ...data };
      }
      writeCollection(this.collectionName, docs);
    }

    async delete() {
      const docs = readCollection(this.collectionName);
      const filtered = docs.filter(d => d.id !== this.id);
      writeCollection(this.collectionName, filtered);
    }
  }

  class LocalDocumentSnapshot {
    constructor(id, dataVal, existsFlag, collectionName) {
      this.id = id;
      this.dataVal = dataVal;
      this.exists = existsFlag;
      this.ref = new LocalDocumentReference(collectionName, id);
    }

    data() {
      return this.dataVal;
    }
  }

  class LocalQuerySnapshot {
    constructor(docs) {
      this.docs = docs;
      this.empty = docs.length === 0;
    }
  }

  class LocalBatch {
    constructor() {
      this.ops = [];
    }
    delete(ref) {
      this.ops.push({ action: 'delete', ref });
      return this;
    }
    update(ref, data) {
      this.ops.push({ action: 'update', ref, data });
      return this;
    }
    set(ref, data) {
      this.ops.push({ action: 'set', ref, data });
      return this;
    }
    async commit() {
      for (const op of this.ops) {
        if (op.action === 'delete') {
          await op.ref.delete();
        } else if (op.action === 'update') {
          await op.ref.update(op.data);
        } else if (op.action === 'set') {
          await op.ref.set(op.data);
        }
      }
    }
  }

  db = new LocalFirestore();

  // Auto-seed default users if users collection is empty
  db.ready = (async () => {
    try {
      const snap = await db.collection('users').limit(1).get();
      if (snap.empty) {
        const bcrypt = require('bcryptjs');
        const ad = async (p) => await bcrypt.hash(p, 10);
        const defaultUsers = [
          { name: 'School Admin', email: 'admin@school.com', password: await ad('admin123'), role: 'admin', phone: '9876543210' },
          { name: 'John Teacher', email: 'teacher@school.com', password: await ad('admin123'), role: 'teacher', phone: '9876543211' },
          { name: 'Jane Accountant', email: 'accountant@school.com', password: await ad('admin123'), role: 'accountant', phone: '9876543212' },
          { name: 'Vindhiya', email: 'vindhiyakota@gmail.com', password: await ad('vindhiya#1019'), role: 'teacher', phone: '', subject: 'Nursery' },
          { name: 'Sailaja', email: 'sailuamma30@gmail.com', password: await ad('sailu#1019'), role: 'teacher', phone: '', subject: 'Nursery' },
          { name: 'Kiran', email: 'kiran.paridala@gmail.com', password: await ad('kiran#1019'), role: 'teacher', phone: '', subject: 'UKG' },
          { name: 'Swetha', email: 'sanapalaswethauma@gmail.com', password: await ad('sana#1019'), role: 'teacher', phone: '', subject: 'Playgroup' },
          { name: 'Susan', email: 'sweetynsp@gmail.com', password: await ad('sweety#1019'), role: 'teacher', phone: '', subject: 'Playgroup' },
        ];
        for (const u of defaultUsers) {
          await db.collection('users').add(u);
        }
        console.log('Seeded default users into local database');
      }
    } catch (e) {
      console.error('Auto-seed error:', e);
    }
  })();
} else {
  db.ready = Promise.resolve();
}

module.exports = db;
