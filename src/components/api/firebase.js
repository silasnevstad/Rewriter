import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);

async function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            return { success: true, user: userCredential.user }
        })
        .catch((error) => {
            const errorCode = error.code;
            return { success: false, error: errorCode };
        });
}


async function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            return { success: true, user: userCredential.user }
        })
        .catch((error) => {
            const errorCode = error.code;
            return { success: false, error: errorCode };
        });
}

function signOut() {
    auth.signOut().then(() => {
    }).catch((error) => {
    });
}

async function addUserApiKey(email, apiKey) {
    await removePrevoiusApiKey(email);
    addDoc(collection(db, "apiKeys"), {
        email: email,
        apiKey: apiKey
    });
}

async function removePrevoiusApiKey(email) {
    const querySnapshot = await getDocs(collection(db, "apiKeys"));
    querySnapshot.forEach((doc) => {
        if (doc.data().email === email) {
            deleteDoc(doc.ref);
        }
    });
}

async function getUserApiKey(email) {
    const querySnapshot = await getDocs(collection(db, "apiKeys"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email === email) {
            return data.apiKey;
        }
    });
}

export { signUp, signIn, signOut, addUserApiKey, getUserApiKey };