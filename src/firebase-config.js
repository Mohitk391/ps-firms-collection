// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBypMZ_yQRrhVcpDQnS2adjUc-2uDWTW4Q",
  authDomain: "ps-firms-collection.firebaseapp.com",
  projectId: "ps-firms-collection",
  storageBucket: "ps-firms-collection.appspot.com",
  messagingSenderId: "463483138478",
  appId: "1:463483138478:web:80a35ee715d6986304d83f",
  measurementId: "G-ZJ6RRCKBZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const db = getFirestore(app);