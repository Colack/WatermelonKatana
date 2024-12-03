const Mongoose = require("mongoose");
const { Logger, logInfo } = require('../util/js/logger');
const dotenv = require('dotenv').config();

Mongoose.set('strictQuery',true);

const connectDB = async () => {
  try {
    await Mongoose.connect(process.env.MONGODB_PASSWORD, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(logInfo("MongoDB Connected"));
  }
  catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;