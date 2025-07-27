import { auth, signInWithEmailAndPassword,  dbd, reff, set,onAuthStateChanged, createUserWithEmailAndPassword } from "./javascript/config.js";


// signing with existing user
const emailInput = document.getElementById("email");
const passwordInputElement = document.querySelector('password-input');
const passwordInput = passwordInputElement.shadowRoot.getElementById('password');
const signinButton = document.getElementById("signin");

// Function to check if the email is valid
function isEmailValid(email) {
  // Add your email validation logic here
  return /\S+@\S+\.\S+/.test(email);
}

// Function to check if the password is valid
function isPasswordValid(password) {
  // Add your password validation logic here
  return password.length >= 6;
}

// Function to update sign-in button state based on input validity
function updateSigninButtonState() {
  const emailValid = isEmailValid(emailInput.value);
  const passwordValid = isPasswordValid(passwordInput.value);

  signinButton.disabled = !(emailValid && passwordValid);
}
// Handling Sign with Google
document.getElementById("ContinueWithGoogle").addEventListener("click", function () {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // Structure user data in the specified format
            console.log(user);
            const userData = {
                name: user.displayName || '',
                email: user.email || '',
                phone: user.phoneNumber || '',
                createdAt: new Date()
            };
            const userId = user.uid; // Get the UID of the newly created user
            // Store user data in Firestore
            const userRef = doc(db, 'Users', userId);
            setDoc(userRef, userData, { merge: true }) // Use merge to avoid overwriting existing data
                .then(() => {
                    console.log('User data stored successfully in Firestore');
                })
                .catch((error) => {
                    console.error('Error storing user data in Firestore:', error);
                });
            // Redirect or handle signed-in user

        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            alert(errorMessage);
        });
});
// Add input event listeners to update button state
emailInput.addEventListener("input", updateSigninButtonState);
passwordInput.addEventListener("input", updateSigninButtonState);

document.getElementById("signin").addEventListener("click", (event) => {
  event.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  // Perform additional validation if needed

  // Perform sign-in only if the email and password are valid
  if (isEmailValid(email) && isPasswordValid(password)) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // Handle the signed-in user as needed
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
        // Handle sign-in error
      });
  }
});
// handling creating user
const fullNameInput = document.getElementById("fullName");
const signUpEmailInput = document.getElementById("signupEmail");
const phoneNumberInput = document.getElementById("phoneNumber");
const signUpPasswordInput = document.getElementById("signupPassword");
const signUpSubmitButton = document.getElementById("signupSubmit");

fullNameInput.addEventListener("input", validateSignupForm);
signUpEmailInput.addEventListener("input", validateSignupForm);
phoneNumberInput.addEventListener("input", validateSignupForm);
signUpPasswordInput.addEventListener("input", validateSignupForm);

// Function to validate signup form and enable/disable submit button
function validateSignupForm() {
  const fullNameValid = fullNameInput.value.trim() !== "";
  const emailValid = validateEmail(signUpEmailInput.value.trim());
  const phoneValid = validatePhone(phoneNumberInput.value.trim());
  const passwordValid = validatePassword(signUpPasswordInput.value);

  signUpSubmitButton.disabled = !(fullNameValid && emailValid && phoneValid && passwordValid);
}

// Function to validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate phone number format
function validatePhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

// Function to validate password (you can customize the validation logic)
function validatePassword(password) {
  return password.length >= 6;
}


signUpSubmitButton.addEventListener("click", (e) => {
  e.preventDefault();
  createUserWithEmailAndPassword(auth, signUpEmailInput.value, signUpPasswordInput.value)
  .then((userCredential) => {
     const user = userCredential.user;
     if (!user || !user.uid) {
       throw new Error('User UID is missing');
     }
     return set(reff(dbd, 'Users/' + user.uid), {
       fname: fullNameInput.value,
       email: signUpEmailInput.value,
       phoneNumber : phoneNumberInput.value
     });
  })
  .then(()=>{
     window.alert("Your profile is created succesfully");
  })
  .catch((error)=>{
     window.alert(error.message);
  });
 
})

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    location.href="./dashboard/"
    // ...
  } else {
    // User is signed out
    // ...
  }
});