// Firebase configuration
// Get these values from your Firebase project settings
const firebaseConfig = {
    apiKey: "AIzaSyCJkMCBWwhaCGaBCWbGFWduwqQCHEzEEHk",
    authDomain: "froggysmp-c2ac5.firebaseapp.com",
    projectId: "froggysmp-c2ac5",
    storageBucket: "froggysmp-c2ac5.firebasestorage.app",
    messagingSenderId: "589025592162",
    appId: "1:589025592162:web:5f24dd540d4de22c2a623b",
    measurementId: "G-28C7KF83Z4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();