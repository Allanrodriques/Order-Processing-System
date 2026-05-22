const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  product: String,
  quantity: Number,
  status: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);