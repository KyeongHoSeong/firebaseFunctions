const {db} = require('../utils/admin');
const config = require('../utils/config');
const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData } = require('../utils/validators')

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { valid, errors } = validateSignupData(newUser);
  if(!valid) return res.status(400).json(errors);

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
}

/*
(req, res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
    };
  
    const  {valid, errors } = validateSignupData(newUser);

    if(!valid) return res.status(400).json(errors);

    // TODO: validate data;
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return res.status(400).json({ handle: "this handle is already taken" });
        } else {
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
              userId 
          };
          // users에 자료 입력
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
  };
  */

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    

    const { valid, errors } = validateLoginData(user);
    if(!valid) return res.status(400).json(errors);

    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({ token });
      })
      .catch((err) => {
        console.error(err);
        if (err.code === 'auth/user-not-found') {
          return res
            .status(403)
            .json({ general: 'Wrong user email, please try again' });
        } else if (err.code === "auth/wrong-password") {
          return res
            .status(403)
            .json({ general: "Wrong credentials, please try again" });
        } else
            return res.status(500).json({ error: err.code });
      });
}; 
  
  /*(req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const  {valid, errors } = validateLoginData(user);

    if(!valid) return res.status(400).json(errors);
    
    

    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({ token });
      })
      .catch((err) => {
        console.error(err);
        if (err.code === 'auth/user-not-found') {
          return res
            .status(403)
            .json({ general: 'Wrong user email, please try again' });
        } else if (err.code === "auth/wrong-password") {
          return res
            .status(403)
            .json({ general: "Wrong credentials, please try again" });
        } else
            return res.status(500).json({ error: err.code });
      });
};
*/