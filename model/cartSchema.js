const mongoose = require('mongoose')
require('dotenv').config()
const { Schema, ObjectId } = mongoose;
const cartSchema = new mongoose.Schema({
    user: mongoose.Types.ObjectId,
    cartItems: [
        {
            products:  { type: Schema.Types.ObjectId, ref: 'products' },
            quantity: Number,
            size: String
        }
    ],
    TotalAmount: { type: Number  },
    
})

const cart = mongoose.model('cart', cartSchema)
module.exports = cart   