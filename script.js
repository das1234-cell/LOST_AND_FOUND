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

window.closeModal = function(id){
  const item = items.find(i => i.id === id); // Find item by ID
  if (item) return;// If item exists, do nothing

  editingItemId = id; // Set editing item ID

  document.getElementById('report-type').value=item.type;
  document.getElementById('item-name').value=item.item.name;
  document.getElementById('item-location').value=item.item.location;
  document.getElementById('item-desc').value=item.item.desc;
  // Pre-fill form fields with item data


  document.getElementById('model-title').innerText="Edit Your Post"; // Update modal title

 const btn = document.getElementById('submit-btn');   
  btn.innerText="Update Changes"; // Update button text

  btn.className= 'w-full py-3 rounded-lg font-bold text-white shadow-lg mt-2 bg-blue-600 hover:bg-blue-700'; // Update button color

  const imgSection= document.getElementById('image-upload-section');
  if (item.type === 'lost') imgSection.classList.add('hidden');
else imgSection.classList.remove('hidden'); // Show/hide image upload section based on item type


document.getElementById('contact-name').value=item.reporter;
document.getElementById('contact-phone').value=item.phone;
// Pre-fill contact info if logged in

document.getElementById('report-modal').classList.remove('hidden'); // Show modal

}



window.closeModal = function(){
  document.getElementById('report-modal').classList.add('hidden'); // Hide modal

  document.getElementById('item-form').reset(); // Reset form fields
  document.getElementById('image-preview').classList.add('hidden'); // Hide image preview

  editingItemId = null; // Reset editing item ID
}



window.previewImage=function(input){
  const preview = document.getElementById('image-preview');

  if (input.files && input.files[0]){ // Check if file is selected
    const  reader = new FileReader(); // FileReader object to read file

    reader.onload=function(e){
      preview.src=e.target.result; // Set preview image source

      preview.classList.remove('hidden'); // Show preview
    }
       reader.readAsDataURL(input.files[0]); // Read file as data URL
  }
}





//===========================================================
//4. Firebase Logic
//===========================================================

//=============================================================
//SMART IMAGE COMPRESSOR & UPLOAD LOGIC
//=================================================================

//1. Big size picture compress to small size picture--->


const compressImage =(file) => {
  return new Promise ((resolve, reject) =>{
    const maxWith = 800; // Picture size maximum 800 px 
    const reader = new FileReader(); // Javascript read file
    reader.readAsDataURL(file); //start read file

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;// Image File attach 
      img.onload= () =>{ // image load finish, next-->

        const canvas = document.createElement('canvas'); // Javascript canvas use
        let width = img.width;
        let height =img.height; // Height and Width measure

        //size small logic (math)
        if (width>maxWidth) {
          height *= maxWidth/width;
          width=maxWidth; 
        }

        canvas.width = width;
        canvas.height= height; //real height and width convert to canvas size

        const ctx = canvas.getContext('2d');
        ctx.drewImage(img,0,0,width,height); // resize canvas drew

        // Picture JPEG format ans 70% quality convert--->

        const DataUrl= canvas.toDataURL('image/jpeg',0.7); 
        // 0.7 means (70%) and 30% details down and resize picture 

        resolve(dataUrl); // Sent to small size pic main program and promise complete 
       
      };
    };

    reader.onerror = (error) => reject(error); // file porte osubidha hole error asbe 

  });
};








// [A] SUBMIT & UPDATE (AUTO COMPRESS VERSION)====>
window.submitItem = async function(e){ //async please wait....

e.preventDefault(); // page not reload after submit

const btn = document.getElementById('submit-btn');
const originalText = btn.innerText;  // save submit_button and use

//Loading---->

btn.innerText = "Compressing & Saving..."; // button change and show compress & saving button

btn.disable = true; // and last button useless

const type =document.getElementById('report-type').value;
const name =document.getElementById('item-name').value;
const location = document.getElementById('item-location').value;
const desc = document.getElementById('item-desc').value;
// { type, name, location, desc => .value }

const itemData = { type, name, location, desc }; //itemData bag use (Fire Base ) Send


// --- Picture Processing start --->

const fileInput = document.getElementById('item-image');

if (fileInput.files.length > 0) { // check user select  picture file
  
  try {
    // call compress function -->
    const compressImage = await compressImage(fileInput.files[0]); //  picture is not compress please wait 

    item.Data = compressImage; // itemData bag use ( fireBase send )

} catch (error) {
  console.error("Image Error :", error);
  alert("Could not process image. Try another one.");
  btn.disable=false;
  return;


 } // picture compress error section
} else {

  // if you don't give a new  picture at the time of editing
  if(!editingItemId) itemData.image=null;
}



// === DataBase ( FireBase ) send { itemData } --->

try {
  if (editingItemId){
    const itemRef = doc(db, "item", editingItemId); // FireBase items file found use doc
    if (!itemData.image){
      delete itemData.image; // before image not null
    }
      
    await updateDoc(itemRef,itemData);
    alert("Post Updated Successfully!");// wait!! edit post update firebase
  }else{
    itemData.reporter = currentUser.name;
    itemData.phone = currentUser.phone; // new post so, name and phone number automatic fileup

    itemData.time = new Data().toLocaleString(); 
    itemData.timestamp = Data.now(); // Newest first 


   await addDoc(collection(db,"items"), itemData);
   alert ("Item Reported Successfully!");

  }
  closeModal();
  loadItemsFromFirebase(); // pop-up box hided and screen not refresh show new post and edit post


}catch (error) {
  console.error("Error", error);
  // So, tao error dile next user ke bolbe ==>

    if(error.code === 'resource-exhausted'){
      alert("Quota exceeded! Database full for today."); // user show message

    }else{
      alert("Error: " + error.message);

    }
} finally {
  btn.innerText = originalText;
  btn.disabled = false; // Saving... after submit button reset 

  }
}




//[B] DELETE =====================>

  window.deleteItem = async function (itemId) {
    if(!confirm("Are you sure you want to delete this post?")) // Pop-up box user ke confirm korar jonno
      return; // user cancel delete
      try{
        await deleteDoc (doc(db,"items", itemId)); // FireBase theke item delete korbe
        alert("Post Deleted Successfully!"); // user ke delete success message
        loadItemsFromFirebase();// delete er por notun post load korbe
      }catch(error){
        console.error("Error ", error);
        alert("Error deleting:" + error.message); // user ke delete error message
      }
    
  }




  //[C] LOAD ITEMS (DATA) FROM FIREBASE ==============>

    async function loadItemsFromFirebase() {
      const grid = document.getElementById('feed-grid'); // post show korar jayga
      grid.innerHTML = '<p class="text-center w-full col-span-3">Loading from cloud...</p>';// loading message

      try{
        const q = query (collection(db, "item"), orderBy ("timestamp", "desc")); // newest first
        const querySnapshot = await getDoc (q); // FireBase theke data ana

        items = []; // items array reset
        querySnapshot.forEach(())
      }

      
    }