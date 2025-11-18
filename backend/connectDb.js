const mongoose = require("mongoose");
const { ENV_VARS } = require("./config/envVar.js");

const mongoURI = ENV_VARS.MONGODB_URI;

const connectToMongo = async () => {
  try {
    if (!mongoURI) {
      throw new Error("MongoDB URI is missing from ENV");
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectToMongo;
