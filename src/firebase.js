import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { firebase_api_key, firebase_dev_api_key } from '@/secret'


let config = {
    apiKey: firebase_api_key,
    authDomain: "harmlesskey.firebaseapp.com",
    databaseURL: "https://dndcombat-71e41.firebaseio.com",
    projectId: "dndcombat-71e41",
    storageBucket: "dndcombat-71e41.appspot.com",
    messagingSenderId: "440135570024"
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
