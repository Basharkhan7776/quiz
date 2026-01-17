import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const getFirebaseConfig = () => {
  // 1. Try Local Storage
  const localConfig = localStorage.getItem("firebase_config");
  if (localConfig) {
    try {
      return JSON.parse(localConfig);
    } catch (e) {
      console.error("Invalid firebase config in localStorage", e);
    }
  }

  // 2. Try Environment Variables
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    // Optional Cloudinary Extras
    cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  };
};

const config = getFirebaseConfig();
// Filter out non-firebase keys for initialization to prevent errors
const firebaseInitConfig = { ...config };
delete (firebaseInitConfig as any).cloudinaryCloudName;
delete (firebaseInitConfig as any).cloudinaryUploadPreset;

const app =
  getApps().length === 0 ? initializeApp(firebaseInitConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
