const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();
//step 6
const firebaseConfig = {
   
  };
  
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// get data
app.get("/screams", (req, res) => {
  db
    .collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        //screams.push(doc.data());
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});


// post data
app.post("/scream", (req, res) => {
  const newScreams = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    //createdAt: admin.firestore.Timestamp.fromDate(new Date())
    createdAt: new Date().toISOString(),
  };

  db
    .collection("screams")
    .add(newScreams)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ eror: "something went wrong" });
      console.error(err);
    });
});



//help function
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
};

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
};

// Signup Route
app.post("/signup", (req, res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
    };
  
    let errors = {};

    if (isEmpty(newUser.email)) {
      errors.email = "Email must not be empty";
    } else if (!isEmail(newUser.email)) {
      errors.email = "Musb be a valid email address";
    }

    if (isEmpty(newUser.password)) errors.password = "Must not be empty";
    if (newUser.password !== newUser.confirmPassword)
      errors.confirmPassword = "passwords must match";
    if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    // TODO: validate data;
    // db:usrers handle <=> auth: userID
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
      .get()
      .then((doc) => {
        //if registered at users then err
        if (doc.exists) {
          return res.status(400).json({ handle: "this handle is already taken" });
        } else { // not registered user then create new users a
          return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then((data) => { 
          userId = data.user.uid;
          return data.user.getIdToken();
      })
      .then((idToken) => {// step 7
          //return res.status(201).json({ token });
          token = idToken;
          const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId // auth=>uid = users=>userId
          };
          // setting user credentials at (db => users)
          return db.doc(`/users/${newUser.handle}`).set(userCredentials);    
      })
      .then(() => {
          return res.status(201).json({token});
      })
      .catch((err) => {
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            res.status(400).json( {email: 'Email is already is use'})
        } else {
          return res.status(500).json({ error: err.code });
          }
      });
  });
  
//exports.api = functions.https.onRequest(app);
exports.api = functions.region('asia-northeast3').https.onRequest(app); 
