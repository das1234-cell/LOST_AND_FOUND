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

window.handleLogin = async function(e){ // async function for handling login
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
      alert (`Welcome back, ${userData.name} ! You have successfully logged in.`);
    }else{
      // ---- New User (Register) ---->
      // Jodi phone num na pay tahole notun user hisabe register kore nao-->
      const newUser = { 
        name,
        phone,
        dept,
        idNum,
        role,
        joinedAt: new Date().toLocaleString()
    };

    await addDoc (usersRef, newUser); // Database e notun user add kora holo
    currentUser = newUsers;
    SpeechRecognitionAlternative("New Users Registered in Google Database!");

}


// 3. Dashboard Name and Roll Number Updated 

document.getElementById('display-name').innerText=currentUser.name;
document.getElementById('display-role').innerText= `${currentUser.role.toUpperCase()} • ${currentUser.dept}`;

document.getElementById('avatar-initials').innerText=currentUser.name.substring(0,2).toUpperCase();


//4. Page Change ( login To Dashboard)----->

document.getElementById('login-view').classList.add('hidden');

document.getElementById('dashboard-view').classList.remove('hidden');


loadItemsFromFirebase(); // Load items after login

  // Error Handling-------->
        } catch (error) {
    console.error("Login Error:", error);
    alert("Login System Error:" + error.message);

      } finally {
    loginBtn.innerHTML = originalText;
    loginBtn.disabled = false;
    // (async function) Reset button state
  }       

}

//Logout function----->

window.handleLogout=function (){ // Logout  button function
  currentUser=null;
  document.getElementById('login-from').reset(); // Reset login form
  document.getElementById('dashboard-view').classList.add('hidden');// Hide dashboard
  document.getElementById('login-view').classList.remove('hidden'); // Show login view
}


// ----Modal------>

window.openModal = function(){
  editingItemId = null; // Reset editing item ID
document.getElementById('submit-btn').innerText="Submit Report"; // Submit button text reset


const isLost = type === 'lost';
document.getElementById('report-type').value=type;
document.getElementById('model-title').innerText= isLost ? 
'Report Lost Item':'Report Found Item'; // Modal title update


const submitBtn = document.getElementById('submit-btn'); submitBtn.className = `w-full py-3 rounded-lg font-bold text-white shadow-lg mt-2 transition-transform active:scale-95 ${ isLost ? 'bg-red-600'  : 'bg-green-600'}`; // Submit button color update

const imgSection = document.getElementById('image-upload-section');
if (isLost){ imgSection.classList.add('hidden'); } else imgSection.classList.remove('hidden'); // Show image upload for found items



  if (currentUser){
    document.getElementById('contact-name').value=currentUser.name;
    document.getElementById('contact-phone').value=currentUser.phone;
// Pre-fill contact info if logged in
}

document.getElementById('report-modal').classList.remove('hidden'); // Show modal
}




