import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// ⚠️ Replace with your own Firebase config from:
//    Firebase Console → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey: "AIzaSyA6fCOwezSQA_7gaopkfRbuI2tIy9zj-lo",
  authDomain: "reunion-shirt-vote.firebaseapp.com",
  projectId: "reunion-shirt-vote",
  storageBucket: "reunion-shirt-vote.firebasestorage.app",
  messagingSenderId: "110264180232",
  appId: "1:110264180232:web:68ff50fd59ced8be4cfbbd",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Sign in anonymously — each browser session gets a unique UID
// used to track who has already voted on which design
export function ensureAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then((cred) => resolve(cred.user));
      }
    });
  });
}
