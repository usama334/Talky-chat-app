const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for Users
const MessageSchema = new Schema({
    conversation_id:{
        type:String
    },
    conversation:{
        type:Array,
        sender_id:{
            type:String
        },
        recipient_id:{
            type:String
        },
        content:{
            type:String
        },
        timeStamp:{
            type:new Date("<YYYY-mm-ddTHH:MM:ss>")
        },
        isSeen:{
            type:Boolean
        }
    }
});

module.exports = Message = mongoose.model('messages', MessageSchema);
