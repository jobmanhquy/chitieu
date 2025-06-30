import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAy1seVRiDSIn_pXQy1xxDwc5N8puqeK1Y",
  authDomain: "chitieu-5f558.firebaseapp.com",
  projectId: "chitieu-5f558",
  storageBucket: "chitieu-5f558.firebasestorage.app",
  messagingSenderId: "179251457044",
  appId: "1:179251457044:web:da46fc0b529d190a810b01",
  measurementId: "G-5Z0EBBV3B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Development emulators (uncomment for local development)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;