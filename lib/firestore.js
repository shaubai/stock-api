// Shared Firebase Admin / Firestore initialization for Vercel Serverless
// Functions.
//
// Vercel functions may run as fresh processes per invocation (cold start),
// so a plain in-memory cache is unreliable across requests. Firestore gives
// us a persistent store shared by the on-demand endpoint and the cron
// refresh job.
//
// Credentials come from the FIREBASE_SERVICE_ACCOUNT_KEY env var (the full
// service account JSON, as a single-line string) set in the Vercel project
// settings. See README.md for how to generate this key.

const admin = require('firebase-admin');

let app;

function getFirestore() {
  if (!app) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set'
      );
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.firestore();
}

module.exports = { getFirestore };
