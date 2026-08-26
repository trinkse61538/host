import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { runtimeConfig } from '../../config/runtime';

export const firebaseApp = initializeApp(runtimeConfig.firebase);
export const auth = getAuth(firebaseApp);
export const defaultDb = getFirestore(firebaseApp);
export const db = getFirestore(firebaseApp, runtimeConfig.firestoreDatabaseId);
