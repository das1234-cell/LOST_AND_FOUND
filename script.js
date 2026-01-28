
// =======================================
// 1. FIREBASE IMPORT (Login and Storage Ready)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Add 'where'
import { getFirestore, collection, addDoc, getDocs, orderBy, query, deleteDoc, updateDoc, doc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configure Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCSt0trZwnwNPO3QEFbVI7CvB87tH3-OBw", //API key secure
    authDomain: "jis-lost-found.firebaseapp.com",
    projectId: "jis-lost-found",
    storageBucket: "jis-lost-found.firebasestorage.app",
    messagingSenderId: "387785207964",
    appId: "1:387785207964:web:4a62a304c689882affbd59",
    measurementId: "G-V2C5L0JB3J"
};











// Firebase on
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);











// ==========================================
// 2. STATE MANAGEMENT
// ==========================================
let currentUser = null;
let items = [];
let editingItemId = null;












// ==========================================
// 3. GLOBAL FUNCTIONS    
// ========================================== off

// --- LOGIN --->

window.switchLoginTab = function (role) {
    window.currentRole = role;
    document.getElementById('tab-student').className = role === 'student' ? 'tab-active w-1/2 pb-2 text-center transition-colors' : 'tab-inactive w-1/2 pb-2 text-center transition-colors';
    document.getElementById('tab-faculty').className = role === 'faculty' ? 'tab-active w-1/2 pb-2 text-center transition-colors' : 'tab-inactive w-1/2 pb-2 text-center transition-colors';
}

















// --- SMART LOGIN SYSTEM (Google Tool Integration) --->

window.handleLogin = async function (e) { //async function for handling login
    e.preventDefault();
    const loginBtn = document.querySelector('#login-form button');
    const originalText = loginBtn.innerHTML;















    // 1. User Checking .....>
    loginBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Checking ID...';
    loginBtn.disabled = true;

    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    const dept = document.getElementById('user-dept').value;
    const idNum = document.getElementById('user-id').value;
    const role = window.currentRole || 'student';

    try {
        // 2. User Verification... ai number kau ache naki-->
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("phone", "==", phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // --- Old User  (LOGIN) ---
            // Jodi phone Num paowa jay tahole take Old data nia aso-->
            const userData = querySnapshot.docs[0].data();
            currentUser = userData;
            alert(`Welcome back, ${userData.name}! Login Successful.`);
        } else {












            // --- New User (REGISTRATION) ---
            // Jodi phone num na pay tahole notun user hisabe register kore nao-->
            const newUser = {
                name,
                phone,
                dept,
                idNum,
                role,
                joinedAt: new Date().toLocaleString()
            };

            await addDoc(usersRef, newUser); ///Database e notun user add kora holo
            currentUser = newUser;
            alert("New User Registered in Google Database!");
        }












        // 3. Dashboard Name and Roll Number Updated

        document.getElementById('display-name').innerText = currentUser.name;
        document.getElementById('display-role').innerText = `${currentUser.role.toUpperCase()} • ${currentUser.dept}`;
        document.getElementById('avatar-initials').innerText = currentUser.name.substring(0, 2).toUpperCase();

        //4. Page Change ( login To Dashboard)------>

        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('dashboard-view').classList.remove('hidden');

        loadItemsFromFirebase(); // Load items after login
















        // Error Handling-------------->
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login System Error: " + error.message);
    } finally {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
        // (async function ) Reset button state
    }
}









// Logout function--->

window.handleLogout = function () {
    currentUser = null;
    document.getElementById('login-form').reset();
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
}













// --- MODAL --->

window.openModal = function (type) {
    editingItemId = null; // Reset editing item ID
    document.getElementById('submit-btn').innerText = "Submit Report"; // Submit button text reset

    const isLost = type === 'lost';
    document.getElementById('report-type').value = type;
    document.getElementById('modal-title').innerText = isLost ? 'Report Lost Item' : 'Report Found Item'; // Modal title update

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.className = `w-full py-3 rounded-lg font-bold text-white shadow-lg mt-2 transition-transform active:scale-95 ${isLost ? 'bg-red-600' : 'bg-green-600'}`; // Submit button color update

    const imgSection = document.getElementById('image-upload-section');
    if (isLost) imgSection.classList.add('hidden');
    else imgSection.classList.remove('hidden'); // Show image upload for found items

    if (currentUser) {
        document.getElementById('contact-name').value = currentUser.name;
        document.getElementById('contact-phone').value = currentUser.phone;
        // Pre-fill contact info if logged in
    }
    document.getElementById('report-modal').classList.remove('hidden'); //Show modal
}


window.openEditModal = function (id) {
    const item = items.find(i => i.id === id);// Find item by ID
    if (!item) return; // If item exists, do nothing

    editingItemId = id; // Set editing item ID

    document.getElementById('report-type').value = item.type;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-location').value = item.location;
    document.getElementById('item-desc').value = item.desc;
    // Pre-fill form fields with item data

    document.getElementById('modal-title').innerText = "Edit Your Post"; // Update modal title

    const btn = document.getElementById('submit-btn');
    btn.innerText = "Update Changes"; // Update button text


    btn.className = "w-full py-3 rounded-lg font-bold text-white shadow-lg mt-2 bg-blue-600 hover:bg-blue-700"; // Update button color

    const imgSection = document.getElementById('image-upload-section');
    if (item.type === 'lost') imgSection.classList.add('hidden');
    else imgSection.classList.remove('hidden'); // Show/hide image upload section based on item type

    document.getElementById('contact-name').value = item.reporter;
    document.getElementById('contact-phone').value = item.phone;  // Pre-fill contact info if logged in

    document.getElementById('report-modal').classList.remove('hidden'); // Show modal
}



window.closeModal = function () {
    document.getElementById('report-modal').classList.add('hidden');  // Reset form fields
    document.getElementById('item-form').reset();  // Reset form fields
    document.getElementById('img-preview').classList.add('hidden'); // Hide image preview

    editingItemId = null;  // Reset editing item ID
}






window.previewImage = function (input) {
    const preview = document.getElementById('img-preview');

    if (input.files && input.files[0]) {  // Check if file is selected
        const reader = new FileReader();  // FileReader object to read file

        reader.onload = function (e) {
            preview.src = e.target.result; // Set preview image source
            preview.classList.remove('hidden'); // Show preview
        }
        reader.readAsDataURL(input.files[0]); // Read file as data URL
    }
}















// ==========================================
// 4. FIREBASE LOGIC
// ==========================================

// ==========================================
// SMART IMAGE COMPRESSOR & UPLOAD LOGIC
// ==========================================

// ১. this function big size pic convert to small size(Compress) -------->

const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const maxWidth = 800; // Picture size maximum 800 px 
        const reader = new FileReader(); // Javascript read file
        reader.readAsDataURL(file);  //start read file
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result; // Image File attach 
            img.onload = () => { // image load finish, next-->


                const canvas = document.createElement('canvas'); // Javascript canvas use
                let width = img.width;
                let height = img.height;  // Height and Width measure

                // small size logic (math use) ---------->
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;  //real height and width convert to canvas size

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height); // resize canvas drew




                // Picture JPEG format ans 70% quality convert--->


                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);   // 0.7 means (70%) and 30% details down and resize picture 

                resolve(dataUrl);  // Sent to small size pic main program and promise complete 
            };
        };
        reader.onerror = (error) => reject(error);  // file porte osubidha hole error asbe 
    });
};











// [A] SUBMIT & UPDATE (AUTO COMPRESS VERSION) ====================>


window.submitItem = async function (e) {
    //async please wait....

    e.preventDefault(); // page not reload after submit

    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerText;   // save submit_button and use





    // loading------>

    btn.innerText = "Compressing & Saving..."; // button change and show compress & saving button

    btn.disabled = true; // and last button useless

    const type = document.getElementById('report-type').value;
    const name = document.getElementById('item-name').value;
    const location = document.getElementById('item-location').value;
    const desc = document.getElementById('item-desc').value;   // { type, name, location, desc => .value }

    const itemData = { type, name, location, desc };  //itemData bag use (Fire Base ) Send








    // --- pic processing start--->


    const fileInput = document.getElementById('item-image');

    if (fileInput.files.length > 0) { // check user select  picture file


        try {








            // compress function call -------------->

            const compressedImage = await compressImage(fileInput.files[0]);  //  picture is not compress please wait 

            itemData.image = compressedImage;  // itemData bag use ( fireBase send )

        } catch (error) {
            console.error("Image Error:", error);
            alert("Could not process image. Try another one.");
            btn.innerText = originalText;
            btn.disabled = false;
            return;


        }  // picture compress error section
    } else {
        // if you don't give a new  picture at the time of editing
        if (!editingItemId) itemData.image = null;
    }














    // --- Data base (firebase) send ( itemData) --->


    try {
        if (editingItemId) {
            const itemRef = doc(db, "items", editingItemId);  // FireBase items file found use doc
            if (!itemData.image) {
                delete itemData.image;   // before image not null
            }

            await updateDoc(itemRef, itemData);
            alert("Post Updated Successfully!"); // wait!! edit post update firebase
        } else {
            itemData.reporter = currentUser.name;
            itemData.phone = currentUser.phone; // new post so, name and phone number automatic fileup

            itemData.time = new Date().toLocaleString();
            itemData.timestamp = Date.now(); // Newest first

            await addDoc(collection(db, "items"), itemData);
            alert("Item Reported Successfully!");
        }
        closeModal();
        loadItemsFromFirebase(); // pop-up box hided and screen not refresh show new post and edit post


    } catch (error) {
        console.error("Error:", error);
        // if it still gives error, tell next user
        if (error.code === 'resource-exhausted') {
            alert("Quota exceeded! Database full for today.");  // user show message

        } else {
            alert("Error: " + error.message);
        }
    } finally {
        btn.innerText = originalText;
        btn.disabled = false; // Saving... after submit button reset 
    }
}













// [B] DELETE ====================================>


window.deleteItem = async function (itemId) {
    if (!confirm("Are you sure you want to delete this post?")) // Pop-up box user ke confirm korar jonno
        return;  // user cancel delete
    try {
        await deleteDoc(doc(db, "items", itemId)); // FireBase theke item delete korbe

        alert("Post Deleted Successfully!");  // user ke delete success message
        loadItemsFromFirebase(); // delete er por notun post load korbe
    } catch (error) {
        console.error("Error:", error);
        alert("Error deleting: " + error.message); // user ke delete error message
    }
}











// [C] LOAD DATA FROM FIREBASE ------------------->


async function loadItemsFromFirebase() {
    const grid = document.getElementById('feed-grid'); // post show korar jayga
    grid.innerHTML = '<p class="text-center w-full col-span-3">Loading from cloud...</p>'; // loading message

    try {
        const q = query(collection(db, "items"), orderBy("timestamp", "desc")); // newest first
        const querySnapshot = await getDocs(q);  // FireBase theke data ana

        items = []; // items array reset
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() }); // items array te data push
        });
        renderFeed(); // feed render korbe
    } catch (error) {
        console.error("Error:", error);
        grid.innerHTML = '<p class="text-red-500 text-center">Failed to load data.</p>'; // error message
    }
}






// [D] RENDER FEED ------------------>


function renderFeed() {
    const grid = document.getElementById('feed-grid'); // html div use

    grid.innerHTML = ''; // old data clear and new data load

    if (items.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 text-center col-span-3">No items reported yet.</p>';
        return; // item not list
    }

    items.forEach(item => {
        const isLost = item.type === 'lost';
        const badgeClass = isLost ? 'badge-lost' : 'badge-found';
        const badgeText = isLost ? 'LOST' : 'FOUND';
        const icon = isLost ? '<i class="fa-solid fa-circle-question mr-1"></i>' : '<i class="fa-solid fa-check-circle mr-1"></i>'; // icon lost and found 

        const isOwner = currentUser && (currentUser.phone === item.phone); // check it'is current Owner of the item

        let actionButtonsHTML = '';
        if (isOwner) {  // Owner show delete and edit button
            actionButtonsHTML = `
                <div class="flex gap-2">
                    <button onclick="openEditModal('${item.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-3 py-2 rounded-full hover:bg-blue-50 transition flex items-center"><i class="fa-solid fa-pen-to-square mr-1"></i> Edit</button>
                    <button onclick="deleteItem('${item.id}')" class="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 px-3 py-2 rounded-full hover:bg-red-50 transition flex items-center"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            `; // edit and delete button design and function
        }

        let imageHTML = item.image ? `<div class="w-full h-40 bg-gray-100 mb-3 rounded-lg overflow-hidden border border-gray-200"><img src="${item.image}" class="w-full h-full object-cover"></div>` : (!isLost ? `<div class="w-full h-40 bg-gray-100 mb-3 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-gray-200"><i class="fa-solid fa-image mr-2"></i> No Image</div>` : ''); // image section ( pic upload yes/no )

        const card = document.createElement('div');
        card.className = 'glass-card p-5 hover:shadow-xl transition-shadow flex flex-col h-full fade-in';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${badgeClass}">${icon} ${badgeText}</span>
                <span class="text-xs text-gray-500">${item.time}</span>
            </div>
            ${imageHTML}
            <h3 class="font-bold text-lg text-gray-800 leading-tight mb-1">${item.name}</h3>
            <p class="text-xs text-blue-600 font-medium mb-3"><i class="fa-solid fa-location-dot mr-1"></i> ${item.location}</p>
            <p class="text-sm text-gray-600 mb-4 flex-grow">${item.desc}</p>
            <div class="pt-4 border-t border-gray-200/50 mt-auto">
                <div class="flex justify-between items-center mb-2">
                     <div class="text-xs">
                        <p class="text-gray-400">Reported by</p>
                        <p class="font-semibold text-gray-700">${item.reporter}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center gap-2">
                    ${actionButtonsHTML}
                    <a href="tel:${item.phone}" class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-full shadow-md transition-transform active:scale-95 flex items-center ml-auto"><i class="fa-solid fa-phone mr-2"></i> Call</a>
                </div>    
            </div> 
        `; // card created
        grid.appendChild(card); //grid e card append korbe
    });
}