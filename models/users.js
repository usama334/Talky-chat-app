const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  profile_picture:{
      type: String
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  dob:{
      type:String
  },
  gender:{
      type:String
  },
  bio:{
      type:String
  },
  isPublic:{
    type:Boolean
  },
  is_verified:{
      type:Boolean
  },
  token:{
    type: Number
  },


}, {
    collection: 'users'
  })

module.exports = mongoose.model('User', userSchema);