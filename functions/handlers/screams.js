const {db} = require ('../utils/admin')

exports.getAllScreams = (req, res) => {
  db.collection("screams")
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
};


// post data
/* at test
{
    "body": "data daa body...",
    "userHandle" : "userHadle4"
}
*/
exports.postOneScream = (req, res) => {

    if(req.body.body.trim() === ""){
        return res.status(400).json({body: 'Body must not be empty'})
    }

  const newScreams = {
    body: req.body.body,
    //userHandle: req.body.userHandle,
    userHandle: req.user.handle,// passed through FBAuth
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
}

//fetch one scream
exports.getScream = (req, res) => {
  let screamData = {};
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "scream not found" });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      //screamData.comments.screamId = doc.id;
      return db
        .collection("comments")
        .orderBy('createdAt', 'desc')
        .where("screamId", "==", req.params.screamId)
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.error(err);
       res.status(500).json({ error: err.code });
    });
};

//comment on a scream...
exports.commentOnScream = (req, res) => {
  if(req.body.body.trim() === '') 
    return res.status(400).json({error: "must not be empty"});
  
    const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };
  console.log(newComment);

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if(!doc.exists) {
        return res.status(404).json({ error: "scream not found" });
      }
      return db.collection('comments').add(newComment);
      //return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
      // })
      // .then(() => {
      //   return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: 'Something went wrong'});
    })
}