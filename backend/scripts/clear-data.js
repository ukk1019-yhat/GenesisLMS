require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = (() => {
  const env = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (env) return JSON.parse(env);
  try {
    return require('../firebase-service-account.json');
  } catch {
    return null;
  }
})();

if (!serviceAccount) {
  console.error('Firebase service account not found');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();

const collections = ['students', 'fees', 'marks', 'attendance', 'audit_logs', 'inquiries'];

async function clearData() {
  for (const name of collections) {
    const snap = await db.collection(name).get();
    const batch = db.batch();
    let count = 0;
    snap.docs.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
      console.log(`Cleared ${count} docs from "${name}"`);
    } else {
      console.log(`"${name}" is already empty`);
    }
  }
  console.log('\nDone. All collections cleared.');
}

clearData().catch(console.error);