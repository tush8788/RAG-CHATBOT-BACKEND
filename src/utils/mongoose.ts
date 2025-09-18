import mongoose from "mongoose";
import config from "../config";

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbURL);
        console.log('DB connected');
    } catch (error) {
        console.error('DB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;