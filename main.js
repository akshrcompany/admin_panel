import { auth, onAuthStateChanged, reff, onValue, dbd, doc, getDoc, db, collection, getDocs, signOut } from "../public/javascript/config.js";

var uid = null;
onAuthStateChanged(auth, async (user) => {
  if (user) {

    uid = user.uid;

    const docRef = collection(db, "Transactions");
   

   

    // ...
  } else {
    // User is signed out
    // ...
    window.location.href = "./login.html";
  }
});



// Handle Sign Out
document.getElementById("signout").addEventListener("click", () => {
  signOut(auth).then(() => {
    // Sign-out successful.
    window.location.href = "./login.html";
  }).catch((error) => {
    // An error happened.
    console.error("Sign out error:", error);
  });
});