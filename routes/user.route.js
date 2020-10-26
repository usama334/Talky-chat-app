// const database = require('./../config/firebase-config');
const auth = require('./../middleware/auth');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require("nodemailer");
// let database = firebase.database();
var randomstring = require("randomstring");
const dbFireStore = require('./../config/firebase-config');

let transporter = nodemailer.createTransport({
  service: 'gmail', // true for 465, false for other ports
  auth: {
    user: 'enabling.systems000@gmail.com', // generated ethereal user
    pass: 'Admin@123!', // generated ethereal password
  },
});


let express = require('express'),
  router = express.Router();

// let userRef = database.ref('users');
const userRef = dbFireStore.collection('users');





// CREATE User
router.route('/create-user').post(async (req, res, next) => {
  let id = randomstring.generate(15);
  const email = req.body.email;
  const password = req.body.password;
  req.body.token = Math.floor(Math.random() * 999999) + 1;
  let response;

  const userExists = await userRef.where('email', '==', email).get();

  if (userExists._size == 0) {

    let info = transporter.sendMail({
      from: '"Enabling Systems" <enabling.systems000@gmail.com>', // sender address
      to: req.body.email, // list of receivers
      subject: "Account Verification Required", // Subject line
      text: "", // plain text body
      html: "<b>Account Verification Required</b>" +
        "<br/>" + "<p>Please copy the below token code and paste it in verification form to complete your account verification</p>" + "<br>" +
        "<strong>" + req.body.token + "</strong>", // html body
    });
    // console.log('User has been successfully created');

    userRef.doc(id).set({
      _id: id,
      profile_picture: 'https://firebasestorage.googleapis.com/v0/b/talky-85121.appspot.com/o/images%2Fdummy-member.jpg?alt=media&token=05982297-bb87-4d79-a880-c1682b045eff',
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      dob: '',
      gender: '',
      bio: '',
      isPublic: true,
      is_verified: false,
      token: req.body.token

    }).then(function () {
      res.json({ status: "ok", data: "User Successfully created", user_id: id });
    });
  }
  else {
    // displayError('signup-form-fields', 'User account already exists, please login to continue');
    response = { status: 'error', data: 'User account already exists, please login to continue' };
    res.json(response);
  }



});

//============================verify token using firebase=============================
//verify Token
router.route('/verify').post(async (req, res) => {
  const token = req.body.token;
  const _id = req.body.id;
  // console.log('user id is : ' + _id);
  let result = await userRef.doc(_id).get();
  if (result.exists && token == result.data().token) {
    // console.log('Token verification complete');
    userRef.doc(_id).update({ "is_verified": true });
    let response = {
      status: 'ok',
      data: 'Account successfully verified'

    }
    res.json(response);
  }
  else {
    // console.log('Token verification failed');
    let response = {
      status: 'fail',
      data: 'Your token is invalid. Please enter a valid token'
    }
    res.json(response);
  }

})



// =========================== login routes using firebase  ================================

router.route('/login').post(async (req, res) => {
  let user = null;
  console.log('Login called');
  const email = req.body.email;
  const password = req.body.password;
  const userExists = await userRef.where('email', '==', email).get();
  if (userExists._size == 0) {
    // console.log("This email isn't registered.");
    let response = {
      user:
      {
        status: 'error',
        data: "This email isn't registered."
      }
    };
    return res.json(response);
  }
  else {
    userExists.forEach(logUser => {
      console.log('Accessed table');
      if (logUser.data().password == password) {
        let user = logUser.data();
        // console.log('successfully logged in');
        const loggedUser = {
          id: user._id
        };
        const accessToken = jwt.sign(loggedUser, process.env.ACCESS_TOKEN_SECRET);
        // localStorage.setItem('authToken', accessToken);
        res.cookie("authToken", accessToken).json({
          accessToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            status: 'ok',
            loggedUser: user
          }
        });
      }
      else {
        // console.log('Wrong password');
        let response = {
          user:
          {
            status: 'error',
            data: "Password incorrect"
          }
        };
        return res.json(response);
      }
    });
  }

});



// ========================== Display single user Firebase =============================
router.route('/user-details').post(async (req, res) => {
  const _id = req.body.user_id;
  let result = await userRef.doc(_id).get();
  if (result.exists) {
    let user = result.data()
    res.json({
      user: user,
      status: 'ok',
      data: 'User found successfully',
      profile_picture: user.profile_picture,
      name: user.name,
      email: user.email,
      dob: user.dob,
      gender: user.gender,
      bio: user.bio,
      password: user.password,
      isPublic: user.isPublic
    });
  }
  else {
    // console.log(" user not found");
    res.json({
      status: 'fail', data: 'user doesnt exists'
    })
  }

})




// =============================================== Read single user using firebase ====================================
// READ Single User
router.route('/dashboard').post(async (req, res) => {
  const _id = req.body.id;
  let score = 0;
  let result = await userRef.doc(_id).get();
  if (result.exists) {
    let user = result.data();
    if (user.profile_picture != '') {
      score += 16.66;
    }
    if (user.name != '') {
      score += 16.66;
    }
    if (user.email != '') {
      score += 16.66;
    }
    if (user.dob != '') {
      score += 16.66;
    }
    if (user.gender != '') {
      score += 16.66;
    }
    if (user.bio != '') {
      score += 16.66;
    }
    res.json({
      status: 'ok',
      name: user.name,
      profile_completion: score,
      isVerified: user.is_verified
    })

  }
  else {
    res.json({
      status: 'fail',
      data: 'User doesnt exist'
    })
  }


});




//======================Read Users Firebase=====================
router.route('/').get(async (req, res) => {
  let users = [];
  // console.log('displkay users');

  let result = await userRef.get();
  await result.forEach(doc => {
    // console.log('user', '=>', doc.data());
    users.push(doc.data());
  });
  res.json(users);



})

// =====================Edit Single User FIrebase ================

router.route('/update-user').put(async(req, res, next) => {
  // console.log('calledd');
  let _id = req.body._id;
  console.log('ispublic: ' + req.body.isPublic);
  let user=await userRef.doc(_id).get();
  
  if(user.data().password===req.body.password){
    userRef.doc(_id).update({
      "name": req.body.name,
      'gender': req.body.gender,
      'isPublic': req.body.isPublic,
      'bio': req.body.bio,
      'dob': req.body.dob,
  
    }).then(function () {
  
      res.json({ status: 'ok', message:'Wrong password' })
    });
  }
  else{
    console.log('wrong password');
    res.json({status:'fail', message:'Wrong password'});
  }

  

})




// update profile picture firebase========================
// update profile pic
router.route('/update-profile-pic').put((req, res, next) => {
  let _id = req.body._id;
  userRef.doc(_id).update({ 'profile_picture': req.body.profile_picture }).then(function () {
    res.json({
      data: 'Profile picture successfully updated',
      status: 'ok',
    })
  });


})

// delete request
router.delete('/delete', auth, async (req, res) => {
  let _id = req.body.user_id;
  userRef.doc(_id).delete().then(function () {
    res.json({ status: 'ok', data: 'Profile successfully deleted' });
  })
})

module.exports = router;