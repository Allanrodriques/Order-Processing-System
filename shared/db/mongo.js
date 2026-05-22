const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://136.114.90.19:27017/orderdb");
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
  }
}

module.exports = connectDB;