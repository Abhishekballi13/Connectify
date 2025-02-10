const mongoose = require('mongoose');
const dotenv = require("dotenv");

dotenv.config();

const connectDb = async () => {
   await mongoose.connect(
     process.env.API_KEY_MONGO
   );
};

module.exports = connectDb;