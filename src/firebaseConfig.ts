import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLLnuxpFnKO-mhDTyluet2HEIeHKqZc5Q",
  authDomain: "ejoutia-chat.firebaseapp.com",
  projectId: "ejoutia-chat",
  storageBucket: "ejoutia-chat.firebasestorage.app",
  messagingSenderId: "109476745376",
  appId: "1:109476745376:web:186f4958b8adad5630f9c5",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);