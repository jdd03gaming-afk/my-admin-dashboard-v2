// IMPORTANT: paste your firebaseConfig values below in firebaseConfig object
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

/* Paste your config here (replace placeholders) */
const firebaseConfig = {
  apiKey: "AIzaSyB3zyL9qZt7tD_O5R8ZBKTeFFxWo7JW7mU",
  authDomain: "my-admin-dashboard-9d32b.firebaseapp.com",
  projectId: "my-admin-dashboard-9d32b",
  storageBucket: "my-admin-dashboard-9d32b.firebasestorage.app",
  messagingSenderId: "265651411193",
  appId: "1:265651411193:web:95d9d9d1bf7d77e43aaa28",
  measurementId: "G-R60SXGN0WX"
};

const app = initializeApp(firebaseConfig);
try {
  if (firebaseConfig.measurementId && firebaseConfig.measurementId !== 'REPLACE_MEAS_ID') {
    getAnalytics(app);
  }
} catch(e){ console.warn('Analytics init failed', e); }

const auth = getAuth(app);
const db = getFirestore(app);

// UI elements
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const userNameEl = document.getElementById('userName');
const statRecords = document.getElementById('stat-records');
const statBalance = document.getElementById('stat-balance');
const statPrice = document.getElementById('stat-price');
const recordsBox = document.getElementById('recordsBox');
const statusEl = document.getElementById('status');

function setStatus(msg, isError=false){
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#c0392b' : '#2c3e50';
}

// Auth state observer
onAuthStateChanged(auth, async (user) => {
  console.log('auth state changed', user);
  if (user) {
    // show dashboard
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    userNameEl.textContent = user.email || user.displayName || 'User';
    await loadUserData(user.uid);
  } else {
    // show login
    loginPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    userNameEl.textContent = '';
    recordsBox.value = '';
    setStatus('');
  }
});

// login function
export async function login(){
  const raw = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!raw || !password) { alert('Enter email/username and password'); return; }

  // If you prefer username-login trick: uncomment below and create users in Firebase as username@app.com
  // const email = raw.includes('@') ? raw : (raw + '@app.com');
  const email = raw; // use as-is (must match email in Firebase Auth)
  try {
    setStatus('Logging in...');
    await signInWithEmailAndPassword(auth, email, password);
    setStatus('Login successful');
  } catch(err){
    console.error('login error', err);
    alert('Login failed: ' + err.message);
    setStatus('Login failed: ' + err.message, true);
  }
}

// logout
export async function logout(){
  try {
    await signOut(auth);
    setStatus('Logged out');
  } catch(err){
    console.error('logout error', err);
    setStatus('Logout error: ' + err.message, true);
  }
}

// load user data from Firestore (document id = uid)
export async function loadUserData(uid){
  try {
    setStatus('Loading data...');
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()){
      const data = snap.data();
      statRecords.textContent = data.totalRecords ?? 0;
      statBalance.textContent = (data.balance ?? 0).toFixed(2);
      statPrice.textContent = (data.pricePerRecord ?? 0.40).toFixed(2);
      if (Array.isArray(data.records)) recordsBox.value = data.records.join('\n');
      else recordsBox.value = data.text ?? '';
      setStatus('Data loaded');
    } else {
      // init empty doc for user
      await setDoc(doc(db,'users', uid), {
        balance: 0,
        totalRecords: 0,
        pricePerRecord: 0.40,
        records: [],
        createdAt: serverTimestamp()
      });
      statRecords.textContent = 0;
      statBalance.textContent = '0.00';
      statPrice.textContent = '0.40';
      recordsBox.value = '';
      setStatus('No data yet — initialized');
    }
  } catch(err){
    console.error('load user data error', err);
    setStatus('Load error: ' + err.message, true);
  }
}

// save data (from editable mode)
export async function saveData(){
  const user = auth.currentUser;
  if (!user) { alert('Login first'); return; }
  const text = recordsBox.value;
  // split into lines as records array
  const lines = text.split('\n').map(s=>s.trim()).filter(Boolean);
  try {
    await setDoc(doc(db,'users', user.uid), {
      records: lines,
      totalRecords: lines.length,
      balance: parseFloat(statBalance.textContent) || 0,
      pricePerRecord: parseFloat(statPrice.textContent) || 0.40,
      updatedAt: serverTimestamp()
    }, { merge: true });
    alert('Data saved');
    setStatus('Saved successfully');
    // hide save button
    document.getElementById('saveBtn').style.display = 'none';
  } catch(err){
    console.error('save error', err);
    alert('Save failed: ' + err.message);
    setStatus('Save error: ' + err.message, true);
  }
}

// enable edit mode
export function editMode(){
  recordsBox.removeAttribute('readonly');
  recordsBox.focus();
  document.getElementById('saveBtn').style.display = 'inline-block';
  setStatus('Edit mode — remember to Save');
}

// copy all
export function copyAll(){
  navigator.clipboard.writeText(recordsBox.value);
  alert('Copied to clipboard');
}

// delete all (clear user's document)
export async function deleteAll(){
  const user = auth.currentUser;
  if (!user) return alert('Login first');
  if (!confirm('Are you sure you want to delete your saved data? This cannot be undone.')) return;
  try {
    await setDoc(doc(db,'users', user.uid), {
      records: [],
      totalRecords: 0,
      balance: 0,
      pricePerRecord: 0.40,
      updatedAt: serverTimestamp()
    }, { merge: true });
    recordsBox.value = '';
    statRecords.textContent = 0;
    statBalance.textContent = '0.00';
    statPrice.textContent = '0.40';
    setStatus('All data deleted (reset)');
  } catch(err){
    console.error('delete error', err);
    setStatus('Delete error: ' + err.message, true);
  }
}

// expose for inline onclicks
window.login = login;
window.logout = logout;
window.saveData = saveData;
window.loadData = loadUserData;
window.copyAll = copyAll;
window.deleteAll = deleteAll;
window.editMode = editMode;
