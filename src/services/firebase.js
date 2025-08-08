import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/auth';

// NOTE: You need to provide your own Firebase configuration values.
// Create a `.env` file in the root of the project with variables like
// REACT_APP_FIREBASE_API_KEY=your-api-key
// REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
// REACT_APP_FIREBASE_PROJECT_ID=your-project-id
// REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
// REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
// REACT_APP_FIREBASE_APP_ID=your-app-id
// These environment variables are automatically picked up by Create React App.

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const firestore = app.firestore();
const storage = app.storage();
const auth = app.auth();

export { firestore, storage, auth };