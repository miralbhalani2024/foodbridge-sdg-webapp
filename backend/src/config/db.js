/**
 * db.js — connects to MongoDB using Mongoose (an ODM: Object Data Modeling library).
 * Mongoose lets us define Schemas (structure + validation) for MongoDB documents.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // fail after 5 s (instead of 30 s) if MongoDB isn't running, with a clear message
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   → Is MongoDB running? Check MONGO_URI in backend/.env');
    process.exit(1); // stop the app — it cannot work without a database
  }
};

module.exports = connectDB;
