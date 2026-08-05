import mongoose from "mongoose";

const connectDB = async () => {

    // 1. Check if it is already connected.
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;

    // 2. Validation / Safety Check
    if (!uri) {
        throw new Error("MONGODB_URI is missing from environment variables.")
    }

    if (!dbName) {
        throw new Error("DB_NAME is missing from environment variables.")
    }

    // 3. Database Connection
    const connectionInstance = await mongoose.connect(uri, { dbName })
    console.log(`MongoDB Connected Successful! ${connectionInstance.connection.host}/${connectionInstance.connection.name} `);

    return connectionInstance
}

// 4. Always keep an eye on the background to see if the connection drops.
mongoose.connection.on("error", (err) => {
    console.error("MongoDB Error:", err.message)
})

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB Disconnected")
})

export default connectDB;