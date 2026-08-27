const admin = require('firebase-admin');
require('dotenv').config({ debug: false, quiet: true });
const logger = require('./logger');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

const isPlaceholder = (value) => !value || value.trim() === '' || value.includes('REPLACE_WITH_REAL_VALUE');

let firebaseApp = null;
let messagingInstance = null;
let bucketInstance = null;

if (isPlaceholder(projectId) || isPlaceholder(clientEmail) || isPlaceholder(privateKey)) {
  logger.warn('Firebase Admin SDK not configured (missing/placeholder FIREBASE_* env vars). Push notifications and cloud file storage are disabled until real credentials are supplied.');
} else {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // .env files cannot hold real newlines, so the private key is stored with literal "\n" sequences.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket: !isPlaceholder(storageBucket) ? storageBucket : undefined,
    });
    messagingInstance = admin.messaging();
    if (!isPlaceholder(storageBucket)) {
      bucketInstance = admin.storage().bucket();
    } else {
      logger.warn('FIREBASE_STORAGE_BUCKET missing/placeholder. Cloud Storage uploads are disabled until it is supplied.');
    }
  } catch (err) {
    logger.error('Failed to initialize Firebase Admin SDK: ' + err.message);
    firebaseApp = null;
    messagingInstance = null;
    bucketInstance = null;
  }
}

module.exports = {
  admin,
  isFirebaseEnabled: () => !!firebaseApp,
  isStorageEnabled: () => !!bucketInstance,
  getMessaging: () => messagingInstance,
  getBucket: () => bucketInstance,
};
