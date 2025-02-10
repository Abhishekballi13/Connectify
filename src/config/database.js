const mongoose = require('mongoose');

const connectDb = async () => {
   await mongoose.connect(
    "mongodb+srv://abhishekdvd:mefQP7JNM9nMrV63@cluster0.xfen9.mongodb.net/connectify"
   );
};

module.exports = connectDb;