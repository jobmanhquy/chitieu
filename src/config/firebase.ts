import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration using environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAy1seVRiDSIn_pXQy1xxDwc5N8puqeK1Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chitieu-5f558.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chitieu-5f558",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chitieu-5f558.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "179251457044",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:179251457044:web:da46fc0b529d190a810b01",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5Z0EBBV3B6"
};

// Log configuration for debugging (remove in production)
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? '***' + firebaseConfig.appId.slice(-4) : 'missing',
  measurementId: firebaseConfig.measurementId
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Initialize Analytics only if measurement ID is provided
export const analytics = firebaseConfig.measurementId ? getAnalytics(app) : null;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters for Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Development emulators (uncomment for local development)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;