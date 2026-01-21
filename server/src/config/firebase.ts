import admin from 'firebase-admin';

let credential;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        credential = admin.credential.cert(serviceAccount);
        console.log('Firebase initialized with service account for project:', serviceAccount.project_id);
    } catch (error) {
        console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS');
        console.error('Error:', error);
        throw error;
    }
} else {
    console.log('Using application default credentials');
    credential = admin.credential.applicationDefault();
}

admin.initializeApp({
    credential: credential
});

export const db = admin.firestore();
export const auth = admin.auth();