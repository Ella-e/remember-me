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

// const analytics = getAnalytics(app);
// // Import the functions you need from the SDKs you need
// // import * as firebase from "firebase/app";
// // import "firebase/auth";
// import * as firebase from 'firebase/app';
// // import firebase from 'firebase';
// // import { getAuth } from 'firebase/auth';
// require('firebase/auth');
// import * as firebaseAuth from 'firebase/auth';

// // import { getAnalytics } from "firebase/analytics";

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const app = firebase.initializeApp({
//   apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
// });

// // export function getFirebaseConfig() {
// //     if (!firebaseConfig || !firebaseConfig.apiKey) {
// //       throw new Error('No Firebase configuration object provided.' + '\n' +
// //       'Add your web app\'s configuration object to firebase-config.js');
// //     } else {
// //       return firebaseConfig;
// //     }
// // }

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // // export const analytics = getAnalytics(app);
// // export const auth = getAuth(app);
// export const auth = firebaseAuth.getAuth(app);
// export default app;

