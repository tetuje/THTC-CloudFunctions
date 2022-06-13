import * as functions from "firebase-functions";
import * as firestore from "@google-cloud/firestore";
const client = new firestore.v1.FirestoreAdminClient();
// Replace BUCKET_NAME
const bucket = "gs://thtc-app.appspot.com/backups/automated-backups";

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

import firebasetools = require("firebase-tools");


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

exports.scheduledFirestoreExport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 168 hours")
    .onRun((context) => {
      const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
      const databaseName = client.databasePath(projectId!, "(default)");
      const today = new Date().toISOString().slice(0, 10);
      const bucketFolder = bucket + "/" + today;

      return client
          .exportDocuments({
            name: databaseName,
            outputUriPrefix: bucketFolder,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: ["activities", "users"],
          })
          .then((responses) => {
            const response = responses[0];
            console.log(`Operation Name: ${response["name"]}`);
          })
          .catch((err) => {
            console.error(err);
            throw new Error("Export operation failed");
          });
    });

exports.deleteUserData = functions
    .region("europe-west3")
    .auth
    .user().onDelete((user) => {
      const userID = user.uid;
      const project = process.env.GCLOUD_PROJECT;
      const path = `/users/${userID}`;

      console.log("Removing user: ", userID);

      firebasetools.firestore
          .delete(path, {
            project: process.env.GCLOUD_PROJECT,
            recursive: true,
            yes: true,
            force: true,
          });
    });
