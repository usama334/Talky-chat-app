const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('./../middleware/auth');
require('dotenv').config();
const dbFireStore = require('./../config/firebase-config');
const messagesRef = dbFireStore.collection('conversation');
const admin = require('firebase-admin');


const messageSchema = require('./../models/message');
const message = require('./../models/message');
// const Conversation = require('./../models/conversation');


// ================READ conversation using firebase =========================
router.route('/total-unread').post(async(req, res) => {
    // let messages = [];
    // console.log('find total undread');
    let count = 0;
    let _id=req.body.id;
    let result=await messagesRef.get();
    // console.log('Result: '+JSON.stringify(result))
    await result.forEach(doc => {
        // console.log(doc.id);
        if(doc.id.includes(_id)===true)
        {
            let conversation=doc.data().conversation;
            conversation.map((msg,index)=>(
                msg.recipient_id===_id && msg.isSeen===false ? (
                    count++
                ):('')
            ))
        }
        // console.log('user', '=>', doc.data().conversation);
        
      });
    res.json({totalUnread:count})
    
});

// ================READ conversation using firebase =========================
router.route('/').post(async (req, res) => {
    
    let messages = [];
    let result = await messagesRef.doc(req.body.conversation_id).get();
    if(result.exists){
        // console.log('Existss');
        res.json({conversation:result.data().conversation});
    }
    else{
        // console.log('doesnt');
        res.json({conversation:[]})
    }
    

})

// ================= create - converation ==================

router.route('/create-conversation').post(async (req, res, next) => {
    // console.log('Create conversation');
    let result = await messagesRef.doc(req.body.conversation_id).get();
    if (!result.exists) {
        messagesRef.doc(req.body.conversation_id).set({
            conversation: []
        })
    }
})


// ==================== Post msg  using firebase=====================

// Post Message (start new conversation or update already existing one )

router.route('/send-message').post((req, res, next) => {

    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    req.body.timeStamp = dateTime;
    req.body.isSeen = false;
    let _id=req.body.conversation_id;
    messagesRef.doc(_id).update({
        conversation: admin.firestore.FieldValue.arrayUnion({
            "sender_id": req.body.conversation.sender_id,
            "recipient_id": req.body.conversation.recipient_id,
            "content": req.body.conversation.content,
            "timeStamp": dateTime,
            "isSeen": false
        })
    }).then(function () {
        // console.log('message Sent');
        res.json({ status: 'ok' })
    });
    
})


// ================================= update Message Status firebase===================================

router.route('/check-msg').post(async(req,res,next)=>{
    console.log('Testtt'); 
    let test_id='Vgp0MXoIfzV1rT0';
    // let result2=await messagesRef.doc('Vgp0MXoIfzV1rT0gNdODP9ErnCKhQY').where('recipient_id','==',test_id).get();
    


})

// Update Messages Status
router.route('/update-message-status').post(async(req, res, next) => {
    // console.log('Conversation Update');
    let _id = req.body.conversation_id;
    let recipient_id = req.body.recipient_id, messagesArray;
    let result = await messagesRef.doc(_id).get();
    
    if (result.exists) {
        messagesArray = await result.data().conversation;
        messagesArray.map((msg,index)=>(
            
                msg.recipient_id==recipient_id?(
                    msg.isSeen=true
                    ):('')
            
            
        ))
       await messagesRef.doc(_id).update({
            conversation: messagesArray
        });
        res.json({status:'ok'})
    }
    else {
        // console.log('Doesnt exists');
        res.json({status:'fail'})
    }

})



module.exports = router;