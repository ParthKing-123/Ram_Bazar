import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function testConnection() {
  try {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Try a simple operation
    const result = await mongoose.connection.collection('customers').findOne({});
    console.log("Found:", result);
    
    mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Error:", err);
  }
}
testConnection();
