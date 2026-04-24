import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appleConfig from '../../firebase-applet-config.json';

// Use environment variables if available (for self-hosting), otherwise fallback to applet config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appleConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appleConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appleConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appleConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appleConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appleConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appleConfig.measurementId,
};

const firestoreDatabaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || appleConfig.firestoreDatabaseId;

if (!firestoreDatabaseId) {
  console.warn("Firestore databaseId is not defined. Falling back to '(default)'.");
} else if (firestoreDatabaseId === '(default)' && appleConfig.firestoreDatabaseId) {
  console.info("Using '(default)' database ID. Note: AI Studio projects often use custom IDs like '" + appleConfig.firestoreDatabaseId + "'.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Always prefer the explicit ID if provided, otherwise fallback to config or default
export const db = getFirestore(app, firestoreDatabaseId || appleConfig.firestoreDatabaseId || '(default)');

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null) {
  if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
    const currentUser = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: currentUser?.uid || '',
        email: currentUser?.email || '',
        emailVerified: currentUser?.emailVerified || false,
        isAnonymous: currentUser?.isAnonymous || false,
        providerInfo: currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || '',
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error logging in with Google', error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out', error);
  }
};

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
