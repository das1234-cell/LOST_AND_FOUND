//===========================================================
// 1. Firebase Import (Login and Storage Ready)
//===========================================================
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

// Add 'where'
import { getFirestone, collection, getDocs, addDoc, deleteDoc, updateDoc, doc, orderBy, query, where} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Configure Firebase
const firebaseConfig ={
       apiKey: "AIzaSyCSt0trZwnwNPO3QEFbVI7CvB87tH3-OBw",
  authDomain: "jis-lost-found.firebaseapp.com",
  projectId: "jis-lost-found",
  storageBucket: "jis-lost-found.firebasestorage.app",
  messagingSenderId: "387785207964",
  appId: "1:387785207964:web:4a62a304c689882affbd59",
  measurementId: "G-V2C5L0JB3J"
};
// Firebase  On
const app = initializeApp(firebaseConfig);
const db = getFirestone(app);