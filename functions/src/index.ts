import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// import firebase-admin = require("firebase-admin");
import admin = require("firebase-admin");
admin.initializeApp();

export const addUser = functions
    .region("europe-west3")
    .auth.user()
    .onCreate((user) => {
      return admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set(JSON.parse(JSON.stringify(user)));
    });
