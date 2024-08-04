// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaxo5O_LC8c5ss5d9oTdb_2h6GCIrHJAE",
  authDomain: "smartmobile-bb299.firebaseapp.com",
  projectId: "smartmobile-bb299",
  storageBucket: "smartmobile-bb299.appspot.com",
  messagingSenderId: "726815338055",
  appId: "1:726815338055:web:41f36e0f32ff78387bcb62",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export { app, auth };
