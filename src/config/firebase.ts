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

// Validate required configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingFields.length > 0) {
  console.error('Missing Firebase configuration fields:', missingFields);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
}

// Log configuration for debugging (remove in production)
console.log('Firebase Config Status:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
  measurementId: firebaseConfig.measurementId ? '✓ Set' : '✗ Missing'
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Initialize Analytics only if measurement ID is provided and in browser
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId 
  ? getAnalytics(app) 
  : null;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters for Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Test Firestore connection
const testFirestoreConnection = async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    // This will trigger a connection test
    await db._delegate._databaseId;
    console.log('✅ Firestore connection test passed');
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
  }
};

// Run connection test in development
if (import.meta.env.DEV) {
  testFirestoreConnection();
}

// Development emulators (uncomment for local development)
// if (import.meta.env.DEV) {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectFunctionsEmulator(functions, 'localhost', 5001);
//     console.log('🔧 Connected to Firebase emulators');
//   } catch (error) {
//     console.log('⚠️ Could not connect to emulators (this is normal if not running)');
//   }
// }

export default app;