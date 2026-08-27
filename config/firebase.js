const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config({ quiet: true });

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
  );
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
} else {
  throw new Error(
    'Firebase credentials missing: set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_PATH in your .env'
  );
}

const firebaseApp = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

/**
 * Mints a Firebase custom token for an already-authenticated user so the client
 * can sign into Firebase and use Firestore Security Rules for chat access,
 * without replacing the app's existing JWT/role auth.
 * @param {{ user_id: string, role: { name: string } }} user - decoded req.auth payload
 */
const mintFirebaseCustomToken = async (user) => {
  return auth.createCustomToken(user.user_id, {
    role: user.role?.name || null,
  });
};

module.exports = { firebaseApp, db, auth, mintFirebaseCustomToken };
