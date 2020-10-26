// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// var firebase = require("firebase/app");
// require("firebase/storage");
// require("firebase/database");
// const firebaseConfig = {
//     apiKey: "AIzaSyALmo4M810vK2fDI5vGzhV1sGXKoq8lNtw",
//     authDomain: "talky-85121.firebaseapp.com",
//     databaseURL: "https://talky-85121.firebaseio.com",
//     projectId: "talky-85121",
//     storageBucket: "talky-85121.appspot.com",
//     messagingSenderId: "1054489747663",
//     appId: "1:1054489747663:web:c7c0096c0da366391357ba",
//     measurementId: "G-6P43RHHHV2"
//   };

// firebase.initializeApp(firebaseConfig);

// // cloud storage reference
// var storage = firebase.storage();

// //database reference
// var database= firebase.database();
//analytics is optional for this tutoral 

// export{
//     storage,database, firebase as default
// };   
// module.exports=database;



const admin = require('firebase-admin');

const serviceAccount = require('./talky-firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports=db;