import multer from "multer";
import crypto from "crypto";
import path from "path";

// Configure storage options for uploaded files 
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp");
    },
    // Generate a secure, unique filename with original extension
    filename: function(req, file, cb){
        const fileExtension = path.extname(file.originalname);
        const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`;
        cb(null, uniqueFilename);
    }
});

// Validate uploaded file types (MIME type check)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/", "video/"];
    const isAllowed = allowedTypes.some((type) => file.mimetype.startsWith(type));

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(
            new Error("Invalid file type. Only images and videos are allowed"),
            false
        );
    }
};

// Create Multer middleware with safe upload limits
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB Limit
    },
});