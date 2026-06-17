import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";
import fs from 'fs';

const configFile = fs.readFileSync('./firebase-applet-config.json', 'utf8');
const config = JSON.parse(configFile);

const firebaseConfig = {
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId);

async function clearMessages() {
  console.log("Fetching messages...");
  const querySnapshot = await getDocs(collection(db, "messages"));
  const deletePromises: Promise<void>[] = [];
  querySnapshot.forEach((doc) => {
    console.log("Deleting document", doc.id);
    deletePromises.push(deleteDoc(doc.ref));
  });
  await Promise.all(deletePromises);
  console.log("All messages deleted.");
  process.exit(0);
}

clearMessages().catch(console.error);
