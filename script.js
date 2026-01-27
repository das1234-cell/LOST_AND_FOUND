


// =======================================
// 1. FIREBASE IMPORT (Login and Storage Ready)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Add 'where'
import { getFirestore, collection, addDoc, getDocs, orderBy, query, deleteDoc, updateDoc, doc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configure Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCSt0trZwnwNPO3QEFbVI7CvB87tH3-OBw",
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

window.switchLoginTab = function(role) {
    window.currentRole = role;
    document.getElementById('tab-student').className = role === 'student' ? 'tab-active w-1/2 pb-2 text-center transition-colors' : 'tab-inactive w-1/2 pb-2 text-center transition-colors';
    document.getElementById('tab-faculty').className = role === 'faculty' ? 'tab-active w-1/2 pb-2 text-center transition-colors' : 'tab-inactive w-1/2 pb-2 text-center transition-colors';
}

// --- SMART LOGIN SYSTEM (Google Tool Integration) --->

window.handleLogin = async function(e) { //async function for handling login
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
        // ম্2. User Verification... ai number kau ache naki-->
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("phone", "==", phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // --- Old User  (LOGIN) ---
            // Jodi phone Num
            // পুরনো ডাটা নিয়ে আসো
            const userData = querySnapshot.docs[0].data();
            currentUser = userData;
            alert(`Welcome back, ${userData.name}! Login Successful.`);
        } else {
            // --- নতুন ইউজার (REGISTRATION) ---
            // যদি না মেলে, তবে নতুন করে সেভ করো
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
        document.getElementById('avatar-initials').innerText = currentUser.name.substring(0,2).toUpperCase();

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

window.handleLogout = function() {   
    currentUser = null;
    document.getElementById('login-form').reset();
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
}

// --- MODAL ---
window.openModal = function(type) {
    editingItemId = null; 
    document.getElementById('submit-btn').innerText = "Submit Report"; 
    
    const isLost = type === 'lost';
    document.getElementById('report-type').value = type;
    document.getElementById('modal-title').innerText = isLost ? 'Report Lost Item' : 'Report Found Item';
    
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.className = `w-full py-3 rounded-lg font-bold text-white shadow-lg mt-2 transition-transform active:scale-95 ${isLost ? 'bg-red-600' : 'bg-green-600'}`;
    
    const imgSection = document.getElementById('image-upload-section');
    if (isLost) imgSection.classList.add('hidden');
    else imgSection.classList.remove('hidden');

    if(currentUser) {
        document.getElementById('contact-name').value = currentUser.name;
        document.getElementById('contact-phone').value = currentUser.phone;
    }
    document.getElementById('report-modal').classList.remove('hidden');
 }

window.openEditModal = function(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    editingItemId = id; 
    document.getElementById('report-type').value = item.type;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-location').value = item.location;
    document.getElementById('item-desc').value = item.desc;
    
    document.getElementById('modal-title').innerText = "Edit Your Post";
    const btn = document.getElementById('submit-btn');
    btn.innerText = "Update Changes"; 
    btn.className = "w-full py-3 rounded-lg font-bold text-white shadow-lg mt-2 bg-blue-600 hover:bg-blue-700"; 

    const imgSection = document.getElementById('image-upload-section');
    if (item.type === 'lost') imgSection.classList.add('hidden');
    else imgSection.classList.remove('hidden');

    document.getElementById('contact-name').value = item.reporter;
    document.getElementById('contact-phone').value = item.phone;

    document.getElementById('report-modal').classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('report-modal').classList.add('hidden');
    document.getElementById('item-form').reset();
    document.getElementById('img-preview').classList.add('hidden');
    editingItemId = null; 
}

window.previewImage = function(input) {
    const preview = document.getElementById('img-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// ==========================================
// 4. FIREBASE LOGIC
// ==========================================

// ==========================================
// SMART IMAGE COMPRESSOR & UPLOAD LOGIC
// ==========================================

// ১. এই ফাংশনটা বড় ছবিকে ছোট (Compress) করে
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const maxWidth = 800; // ছবির সাইজ এর বেশি হবে না
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // সাইজ ছোট করার লজিক
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // ছবিকে JPEG ফরম্যাটে এবং ৭০% কোয়ালিটিতে কনভার্ট করা হচ্ছে
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            };
        };
        reader.onerror = (error) => reject(error);
    });
};

// [A] SUBMIT & UPDATE (AUTO COMPRESS VERSION)
window.submitItem = async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerText;
    
    // লোডিং দেখাবে
    btn.innerText = "Compressing & Saving..."; 
    btn.disabled = true;

    const type = document.getElementById('report-type').value;
    const name = document.getElementById('item-name').value;
    const location = document.getElementById('item-location').value;
    const desc = document.getElementById('item-desc').value;

    const itemData = { type, name, location, desc };

    // --- ছবি প্রসেসিং শুরু ---
    const fileInput = document.getElementById('item-image');
    
    if(fileInput.files.length > 0) {
        try {
            // এখানে আমরা কম্প্রেস ফাংশন কল করছি
            const compressedImage = await compressImage(fileInput.files[0]);
            itemData.image = compressedImage; 

        } catch (error) {
            console.error("Image Error:", error);
            alert("Could not process image. Try another one.");
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }
    } else {
        // এডিটের সময় নতুন ছবি না দিলে
        if (!editingItemId) itemData.image = null;
    }

    // --- ডাটাবেসে পাঠানো ---
    try {
        if (editingItemId) {
            const itemRef = doc(db, "items", editingItemId);
            if (!itemData.image) {
                 delete itemData.image; 
            }
            await updateDoc(itemRef, itemData);
            alert("Post Updated Successfully!");
        } else {
            itemData.reporter = currentUser.name;
            itemData.phone = currentUser.phone;
            itemData.time = new Date().toLocaleString();
            itemData.timestamp = Date.now();
            
            await addDoc(collection(db, "items"), itemData);
            alert("Item Reported Successfully!");
        }
        closeModal();
        loadItemsFromFirebase(); 
    } catch (error) {
        console.error("Error:", error);
        // যদি তাও এরর দেয়, ইউজারকে বলবে
        if (error.code === 'resource-exhausted') {
            alert("Quota exceeded! Database full for today.");
        } else {
            alert("Error: " + error.message);
        }
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// [B] DELETE
window.deleteItem = async function(itemId) {
    if(!confirm("Are you sure you want to delete this post?")) return;
    try {
        await deleteDoc(doc(db, "items", itemId));
        alert("Post Deleted Successfully!");
        loadItemsFromFirebase();
    } catch (error) {
        console.error("Error:", error);
        alert("Error deleting: " + error.message);
    }
}

// [C] LOAD DATA
async function loadItemsFromFirebase() {
    const grid = document.getElementById('feed-grid');
    grid.innerHTML = '<p class="text-center w-full col-span-3">Loading from cloud...</p>';

    try {
        const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        renderFeed();
    } catch (error) {
        console.error("Error:", error);
        grid.innerHTML = '<p class="text-red-500 text-center">Failed to load data.</p>';
    }
}






// [D] RENDER FEED
function renderFeed() {
    const grid = document.getElementById('feed-grid');
    grid.innerHTML = '';

    if(items.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 text-center col-span-3">No items reported yet.</p>';
        return;
    }

    items.forEach(item => {
        const isLost = item.type === 'lost';
        const badgeClass = isLost ? 'badge-lost' : 'badge-found';
        const badgeText = isLost ? 'LOST' : 'FOUND';
        const icon = isLost ? '<i class="fa-solid fa-circle-question mr-1"></i>' : '<i class="fa-solid fa-check-circle mr-1"></i>';
        
        const isOwner = currentUser && (currentUser.phone === item.phone);

        let actionButtonsHTML = '';
        if (isOwner) {
            actionButtonsHTML = `
                <div class="flex gap-2">
                    <button onclick="openEditModal('${item.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-3 py-2 rounded-full hover:bg-blue-50 transition flex items-center"><i class="fa-solid fa-pen-to-square mr-1"></i> Edit</button>
                    <button onclick="deleteItem('${item.id}')" class="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 px-3 py-2 rounded-full hover:bg-red-50 transition flex items-center"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            `;
        }

        let imageHTML = item.image ? `<div class="w-full h-40 bg-gray-100 mb-3 rounded-lg overflow-hidden border border-gray-200"><img src="${item.image}" class="w-full h-full object-cover"></div>` : (!isLost ? `<div class="w-full h-40 bg-gray-100 mb-3 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-gray-200"><i class="fa-solid fa-image mr-2"></i> No Image</div>` : '');

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
        `;
        grid.appendChild(card);
    });
}