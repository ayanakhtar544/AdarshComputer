// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//Firebase configuration Object
const firebaseConfig = {
  apiKey: "AIzaSyDZmBrlT33A0KQuaunosZ6kksV8JD8xj5E",
  authDomain: "chouhan-computers.firebaseapp.com",
  projectId: "chouhan-computers",
  storageBucket: "chouhan-computers.firebasestorage.app",
  messagingSenderId: "187291455574",
  appId: "1:187291455574:web:925df55a0e4cad04596bf7"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services taaki hum puri website me use kar sakein
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // Database ke liye
export const storage = getStorage(app); // Product images ke liye