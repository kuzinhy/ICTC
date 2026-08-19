import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAUoOpM3OrFABluLJlNJKswj4uC4n6m8KY",
  authDomain: "chiasetainguyen-tdm.firebaseapp.com",
  databaseURL: "https://chiasetainguyen-tdm-default-rtdb.firebaseio.com",
  projectId: "chiasetainguyen-tdm",
  storageBucket: "chiasetainguyen-tdm.firebasestorage.app",
  messagingSenderId: "1091475372265",
  appId: "1:1091475372265:web:5b82ece295e8fcfb4c1878",
  measurementId: "G-MFFP5DWNCH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (supported conditionally on client side)
export const analyticsPromise = isSupported().then((supported) => {
  if (supported) {
    return getAnalytics(app);
  }
  return null;
}).catch((err) => {
  console.warn("Analytics initialization skipped or not supported:", err);
  return null;
});

export default app;
