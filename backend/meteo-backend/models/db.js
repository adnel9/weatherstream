const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = `mongodb://${process.env.MONGO_INITDB_DATABASE_USER}:${process.env.MONGO_INITDB_DATABASE_PASSWORD}@${process.env.MONGODB_PRIVATE_IP}:27017/${process.env.MONGO_INITDB_DATABASE}`;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    // console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    // console.log('Error connecting to MongoDB:', error);
  });
