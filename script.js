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

//===========================================================
// 2. State Management
//===========================================================

let currentUser = null;
let items = [];
let editingItemId = null;

//===========================================================
// 3. Global Functions
//===========================================================

// Login ----->

Window.switchLogin = function(role) {
  window.currentRole = role;
  document.getElementById('tab-student').className =role === 'student' ? 'tab-active w-1/2 pb-2 text-center transition-colors' : ' tab-inactive  w-1/2 pb-2 text-center transition-colors';
  document.getElementById('tab-faculty').className =role === 'faculty' ? 'tab-active w-1/2 pb-2 text-center transition-colors' : ' tab-inactive  w-1/2 pb-2 text-center transition-colors';

}


//-------Smart Login System (Google Tool Integration ) --------->

window.handleLogin = async function(e){
  e.preventDefault();
  const loginBtn = document.querySelector ('#login-from button');
  const originalText = loginBtn.innerHTML;

  // 1. User Checking .....>
  loginBtn.innerHTML = '<i class= "fa-solid fa-circle-notch fa-spin"></i> Checking ID...';
  loginBtn.disable = true;


  const name= document.getElementById('user-name').value;
  const phone=document.getElementById('user-phone').value;
  const dept=document.getElementById('user-dept').value;
  const idNum=document.getElementById('user-id').value;
  const role= window.currentRole ||'student';


  try{
    //2. User Verification... ai number kau ache naki>

    const usersRef = collection(db,'users');
    const q = query(usersRef, where ('phone',"==", phone));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty){
      // ---- Old User (Login)---->
      // Jodi phone Num paowa jay tahole take Old data nia aso-->
      const userDocs = querySnapshot.docs[0] .data();
      currentUser = usreData;
      

    }

  }

}