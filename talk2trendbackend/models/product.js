const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: { type: String, required: true }, // changed from imageUrl to image
  category: String,
  stock: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', productSchema);
