const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
let serviceAccount;

try {
  serviceAccount = require(path.resolve(serviceAccountPath));
} catch (err) {
  console.error('Firebase service account key not found at', serviceAccountPath);
  console.error('Create firebase-service-account.json or check the path in .env');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();
console.log('Firebase Firestore initialized');

module.exports = db;
