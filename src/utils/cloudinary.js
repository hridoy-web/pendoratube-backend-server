import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

       // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error.message || error);
        return null;
    } finally {

        // Check if there is a local file path available   
        if (localFilePath) {
            try {

               // Delete the temporary local file safely
                await fs.unlink(localFilePath);
            } catch (cleanUpError) {

                // Log error if file deletion fails so the server does not crash     
                console.error("Local file cleanup failed:", cleanUpError.message || cleanUpError);
            }
        }
    }
};

export default uploadOnCloudinary;