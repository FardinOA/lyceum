const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  members:{
      type:Array
  }

})



module.exports = mongoose.model('Conversation', ConversationSchema);
