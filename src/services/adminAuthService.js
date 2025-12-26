import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Re-use the config, but we need to import it or duplicate it.
// Since firebase.js exports the initialized app, we can just grab the options if available,
// or better, just re-declare the config since it's safe to do so.

const firebaseConfig = {
    apiKey: "AIzaSyACLrxpk5wRhpVCxnoB25R7GE2XUuwsAac",
    authDomain: "office-do-or-due.firebaseapp.com",
    projectId: "office-do-or-due",
    storageBucket: "office-do-or-due.firebasestorage.app",
    messagingSenderId: "93135938226",
    appId: "1:93135938226:web:706e4899facb424cc59fab",
    measurementId: "G-3JNQ26QWRS"
};

/**
 * Creates a user without signing out the specific admin.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<string>} The new user's UID
 */
export async function createSecondaryUser(email, password) {
    // initialize a secondary app
    const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);

    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const uid = userCredential.user.uid;

        // Immediately sign out this secondary user so they aren't "logged in" on this client in any way that might interfere
        await signOut(secondaryAuth);

        return uid;
    } catch (error) {
        throw error;
    }
    // Note: We don't necessarily delete the app because it gets reused, but we could if memory is strict.
}
