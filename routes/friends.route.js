require('dotenv').config();

let express = require('express'),
    router = express.Router();
const dbFireStore = require('./../config/firebase-config');
const friendsRef = dbFireStore.collection('friends');
const admin = require('firebase-admin');


function compare(a, b) {
    const bandA = a.lastContact;
    const bandB = b.lastContact;
    
    let comparison = 0;
    if (bandA > bandB) {
        
      comparison = -1;
    } else if (bandA < bandB) {
        
      comparison = 1;
    }
    return comparison;
  }
  


//friends list using firebase
router.route('/').post(async (req, res) => {
    let friends = [];
    let _id = req.body.user_id
    
    let result = await friendsRef.doc(_id).get();
    if (result.exists) {
        res.json(result.data().friends.sort(compare));
    }
    else {
        res.json(friends);
    }
    

})

// create user friendlist with firebase
router.route('/create-user').post(async (req, res, next) => {
    let _id = req.body.user_id;
    await friendsRef.doc(_id).set({
        friends: []
    })
    res.json({ status: 'ok' });

});

// create user friendlist with firebase
router.route('/sort-friends').post(async (req, res, next) => {
    let _id = req.body.user_id;
    let result=await friendsRef.doc('Vgp0MXoIfzV1rT0').get();
    // res.json({ status: 'ok' });
    if (result.exists) {
        friendsArray = await result.data().friends;
        friendsArray.sort(compare);
        res.json({ status: 'ok' })
    }
});


// updating friends Time Stamp
// ================ Update friend request firebase ====================
router.route('/update-friends-timestamp').post(async (req, res, next) => {
    console.log('update time stamp here');
    let _id = req.body.user_id;
    let friend_id = req.body.friend_id, friendsArray;
    let result = await friendsRef.doc(_id).get();
    if (result.exists) {
        friendsArray = await result.data().friends;
        friendsArray.map((friend, index) => (
            friend.id == friend_id ? (
                friend.lastContact = new Date().getTime()
            ) : ('')
        ))
        await friendsRef.doc(_id).update({
            friends: friendsArray
        });
        res.json({ status: 'ok' })
    }
    else {
        // console.log('Doesnt exists');
        res.json({ status: 'fail' })
    }


})


// ================ Update friend request firebase ====================
router.route('/update-friend-request').post(async (req, res, next) => {

    let _id = req.body.user_id;
    let friend_id = req.body.friend_id, friendsArray;
    let result = await friendsRef.doc(_id).get();
    if (result.exists) {
        friendsArray = await result.data().friends;
        friendsArray.map((friend, index) => (

            friend.id == friend_id ? (
                friend.status = 'Friend'
            ) : ('')


        ))
        await friendsRef.doc(_id).update({
            friends: friendsArray
        });
        res.json({ status: 'ok' })
    }
    else {
        // console.log('Doesnt exists');
        res.json({ status: 'fail' })
    }
    

})



// =============== new friend request firebase ======================
router.route('/push').post(async (req, res, next) => {
    // console.log(JSON.stringify(req.body));
    let _id = req.body.user_id;
    // console.log('Request pushedd');

    friendsRef.doc(_id).update({
        friends: admin.firestore.FieldValue.arrayUnion({
            name: req.body.friend_name,
            id: req.body.friend_id,
            status: req.body.status,
            profile_picture: req.body.profile_picture,
            lastContact:new Date().getTime()
        })
    }).then(function () {
        // console.log('Request sent');
        res.json({ status: 'ok' })
    });

})

// delete friend  using firebase
router.route('/delete-friend').post(async (req, res, next) => {
    let _id = req.body.user_id;
    let del_id = req.body.friend_id, friendsArray;
    let result = await friendsRef.doc(_id).get();
    if (result.exists) {
        friendsArray = result.data().friends;

        await friendsRef.doc(_id).update({
            friends: friendsArray.filter(friend => friend.id !== del_id)
        });
        res.json({ status: 'ok' });
    }
    else {
        // console.log('Doesnt exists');
        res.json({ status: 'fail' })
    }

})



module.exports = router;