import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { firebase_api_key } from '@/secret'


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

export { firebase, auth, db };
