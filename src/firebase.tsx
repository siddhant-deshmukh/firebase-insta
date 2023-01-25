// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYOMyvWTK31hyeOW6WNUljdazyZhpibbo",
  authDomain: "instagram-01-c1cb5.firebaseapp.com",
  projectId: "instagram-01-c1cb5",
  storageBucket: "instagram-01-c1cb5.appspot.com",
  messagingSenderId: "686495298004",
  appId: "1:686495298004:web:3d7405dde1809a09e82641"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app);
