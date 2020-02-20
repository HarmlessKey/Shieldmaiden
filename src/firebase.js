import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

let config = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID
};
firebase.initializeApp(config);

const auth = firebase.auth();
const db = firebase.database();

let config_dev = {
    apiKey: firebase_dev_api_key,
    authDomain: "harmlesskey-dev.firebaseapp.com",
    databaseURL: "https://harmlesskey-dev.firebaseio.com",
    projectId: "harmlesskey-dev",
    storageBucket: "harmlesskey-dev.appspot.com",
    messagingSenderId: "941027776876",
    appId: "1:941027776876:web:05d72b32cdec7b12"
};
let app_dev = firebase.initializeApp(config_dev, "dev");

const db_dev = firebase.database(app_dev);

export { firebase, auth, db, db_dev };
