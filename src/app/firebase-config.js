// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUmmyjb4v69xb0ugrT7YBkL5N6NxN7akA",
  authDomain: "remember-me-eafe0.firebaseapp.com",
  projectId: "remember-me-eafe0",
  storageBucket: "remember-me-eafe0.appspot.com",
  messagingSenderId: "966024955704",
  appId: "1:966024955704:web:d573c29387ff7ace7aa3cd",
  measurementId: "G-VR8F410547"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;