const firebaseAdmin = require("firebase-admin");

const serviceAccount = require("./serviceAccount.json");

if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
    });
}

module.exports = firebaseAdmin;
