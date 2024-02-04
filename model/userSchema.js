const mongoose = require('mongoose');
require("dotenv").config()



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
   
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true, 
  },
  referralLink: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  wallet: {
    type: Number,
    default: 0
  },
  referredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  address: [{
    name:{ type : String },
     address: { type: String },
     city: { type: String },
     pincode: { type: String },
     state: { type: String },
     mobile:{type:Number}
  }],

profilePhoto: {
  type: String,
},
  date: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
