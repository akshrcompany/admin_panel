import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase, ref as reff, onValue, set, update
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword,
  browserSessionPersistence, createUserWithEmailAndPassword,
  GoogleAuthProvider, OAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore, Timestamp, collection, getDocs, doc, updateDoc, arrayUnion,
  getDoc, addDoc, setDoc, query, where, onSnapshot, serverTimestamp, orderBy,
  limit, startAfter
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyAAxUB5JAtEtOPxHJ-dY2EuCXx_aSlutg4",
  authDomain: "main-control-panel.firebaseapp.com",
  databaseURL: "https://main-control-panel-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "main-control-panel",
  storageBucket: "main-control-panel.firebasestorage.app",
  messagingSenderId: "522029341233",
  appId: "1:522029341233:web:29fd4b225fcf4353ea9310",
  measurementId: "G-LJEHL5YVNQ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const dbd = getDatabase(app);

const storage = getStorage(app);
const provider = new GoogleAuthProvider();
const appleprvoider = new OAuthProvider('apple.com');



export {
  auth, db, getAuth, onAuthStateChanged, addDoc, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, browserSessionPersistence,
  getFirestore, collection, getDocs, doc, getDoc, signOut
  , Timestamp, setDoc, updateDoc, arrayUnion, query, where, set, orderBy, limit, startAfter, 
  storage, ref, uploadBytes, getDownloadURL, onSnapshot, onValue, dbd, reff, update,provider,OAuthProvider,GoogleAuthProvider,serverTimestamp,signInWithPopup,appleprvoider 
}