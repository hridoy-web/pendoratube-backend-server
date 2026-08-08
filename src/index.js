import { app } from "./app.js";
import connectDB from "./db/connect.js";

const port = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Express server is running on port ${port}`);
        })
    } catch (err) {
        console.log('Mongodb connection failed:', err);
        process.exit(1);
    }
};

startServer();