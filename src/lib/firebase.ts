import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from "../../firebase-applet-config.json";

const firebaseConfig = {
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  measurementId: config.measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app, config.firestoreDatabaseId);

