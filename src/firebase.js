import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID
};

if(!firebase.apps.length) {
    firebase.initializeApp(config);
}

const auth = firebase.auth();
const db = firebase.database();

/**
 * Async function providing the application time to
 * wait for firebase to initialize and determine if a
 * user is authenticated or not with only a single observable.
 * https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onauthstatechanged
 * @param {Object} store - Vuex store
 * @returns {Promise} - A promise that return firebase.Unsubscribe
 */
const ensureAuthIsInitialized = async (store) => {
    if (store.state.user.uid) return true
    // Create the observer only once on init
    return new Promise((resolve, reject) => {
        // Use a promise to make sure that the router will eventually show the route after the auth is initialized.
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            resolve()
            unsubscribe()
        }, () => {
            reject(new Error('Looks like there is a problem with the firebase service. Please try again later'))
        })
    });
}

export { firebase, auth, db, ensureAuthIsInitialized };
