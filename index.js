const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// post data to firestore
exports.createScream = functions.https.onRequest((req,res) => {
    if(req.method !== 'POST') {
        return res.status(400).json({ error: 'Method not allowed' })
    }

    //define data structure
    const newScreams = {
        body:req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    // post
    admin.firestore()
        .collection('screams')
        .add(newScreams)
        .then(doc => {
            res.json({message: `document ${doc.id} created successfully`});
        })
        .catch(err=> {
            res.status(500).json({eror: 'something went wrong' });
            console.error(err);
        });
});

// get data from firestore by use of firebase-admin
exports.getScreams = functions.https.onRequest((req,res) => {
    admin
      .firestore()
      .collection("screams")
      .get()
      .then((data) => {
        let screams = [];
        data.forEach((doc) => {
          screams.push(doc.data());
        });
        return res.json(screams);
      })
      .catch((err) => console.error(err));
});