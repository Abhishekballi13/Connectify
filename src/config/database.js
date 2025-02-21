const mongoose = require('mongoose');


const connectDb = async () => {
   await mongoose.connect(
     process.env.API_KEY_MONGO
   );
};

module.exports = connectDb;