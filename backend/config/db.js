const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './firebase-service-account.json';
  try {
    serviceAccount = require(path.resolve(serviceAccountPath));
  } catch (err) {
    console.error('Firebase service account key not found at', serviceAccountPath);
    console.error('Set FIREBASE_SERVICE_ACCOUNT_JSON env var or provide the file');
    process.exit(1);
  }
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();
console.log('Firebase Firestore initialized');

module.exports = db;
