require('dotenv').config();
const db = require('../config/db');

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