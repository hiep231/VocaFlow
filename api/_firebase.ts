import * as admin from 'firebase-admin';

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // On Vercel, we can pass the JSON as a base64 encoded string to avoid file system issues
      const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
      
      if (base64ServiceAccount) {
        const serviceAccountStr = Buffer.from(base64ServiceAccount, 'base64').toString('ascii');
        const serviceAccount = JSON.parse(serviceAccountStr);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized via BASE64.');
      } 
      // Fallback for local testing if the user hasn't set the base64 env but has the file
      else if (process.env.NODE_ENV !== 'production') {
        const fs = require('fs');
        const path = require('path');
        const localPath = path.resolve(process.cwd(), 'bot/serviceAccountKey.json');
        
        if (fs.existsSync(localPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          console.log('✅ Firebase Admin initialized via local file.');
        } else {
          console.warn('⚠️ No FIREBASE_SERVICE_ACCOUNT_BASE64 and no local bot/serviceAccountKey.json found.');
        }
      }
    } catch (error) {
      console.error('❌ Firebase Admin init error:', error);
    }
  }

  return admin.apps.length > 0 ? admin.firestore() : null;
}
