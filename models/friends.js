const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let friendsSchema = new Schema({
    user_id:{
        type: String
    },
    friends: {
      type: Array,
      friend: {
        name:String,
        id:String,
        status:String,
        profile_picture:String
      }

    }
  
  }, {
      collection: 'friends'
    }
)
module.exports = mongoose.model('Friends', friendsSchema);