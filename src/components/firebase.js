// src/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDo0xHp8QTvgIDEF0Asdu7YtETUArjM4hw",
  authDomain: "pinple-fd946.firebaseapp.com",
  projectId: "pinple-fd946",
  storageBucket: "pinple-fd946.firebasestorage.app",
  messagingSenderId: "108930538543",
  appId: "1:108930538543:web:61c60bc941fb0aaf18fada",
  measurementId: "G-LFVLVD3XY6",
};

// 중복 초기화 방지
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app =initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = getAuth(app);