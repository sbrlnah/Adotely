import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCD1OqHmNbb9jeVxs0tPOMFuUwvhtW41sM",
  authDomain: "adotely-860da.firebaseapp.com",
  projectId: "adotely-860da",
  storageBucket: "adotely-860da.firebasestorage.app",
  messagingSenderId: "1033317163928",
  appId: "1:1033317163928:web:dd176645b22af0aa0cc1ed",
  measurementId: "G-5FCB2Z5DSE"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

export { auth, db, rtdb, storage };
