import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBSu5weyniAyybo7BGaIkZUDzosbBOac0Y",
  authDomain: "licentanicutalaurentiu.firebaseapp.com",
  projectId: "licentanicutalaurentiu",
  storageBucket: "licentanicutalaurentiu.appspot.com",
  messagingSenderId: "185767909776",
  appId: "1:185767909776:web:bf878573b2d0b42654bb15",
  measurementId: "G-DCFX3ESSJG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, storage, functions };

