const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./utils/fbAuth');

const {
  getAllScreams,
  postOneScream,
  getScream,
  // commentOnScream
} = require("./handlers/screams");

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

// scream route
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
//app.post('/scream/screamId/comment', FBAuth, commentOnScream);
//TODO: delete ascream
//TODO: like a scream
//TODO: unlike a scream

// Users Route
app.post("/signup", signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails); 
app.get('/user', FBAuth, getAuthenticatedUser); 

exports.api = functions.region('asia-northeast3').https.onRequest(app); 