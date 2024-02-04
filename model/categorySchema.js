const mongoose = require("mongoose");

const { Schema } = mongoose;

const categorySchema = new Schema({
  categoryname: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  
  image: {
    type: String,
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
  Status: { type: Boolean, default: true },
  
 
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
