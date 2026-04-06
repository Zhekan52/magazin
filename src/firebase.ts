import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0d-ku6QaWte5xskgUUfHjqDA079JhV_Q",
  authDomain: "magazin-bcd15.firebaseapp.com",
  projectId: "magazin-bcd15",
  storageBucket: "magazin-bcd15.firebasestorage.app",
  messagingSenderId: "191612606509",
  appId: "1:191612606509:web:4934acd5b39dd8a75e00a4",
  measurementId: "G-YFM72DL8KQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);