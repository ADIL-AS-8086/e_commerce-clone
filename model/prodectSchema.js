const mongoose = require("mongoose");


const { Schema, ObjectId } = mongoose;


const ProductsSchema = new Schema({
  name: { type: String },
  price: { type: Number, min: 0 },
  Discountedprice: { type: Number, min: 0 },
  description: { type: String },
  highlight1: { type: String },
  highlight2: { type: String },
  highlight3: { type: String },
  highlight4: { type: String },
  variant: [{
    size: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,

    }
  }],
    offer: {
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    additionalDetails: { type: String },
  },

  timeStamp: { type: Date },
  images: { type: Array },
  colour: { type: String },
  brand: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  isDeleted: { type: Boolean, default: false },
  Status: { type: Boolean, default: true },
}, { timestamps: true });


const Products = mongoose.model("products", ProductsSchema);

module.exports = Products;
