import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // 1 - Get access token from cookies OR Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

        if (!token) {
            throw new ApiError(401, "Un-Authorized Request")
        }

        // 2 - Verify token validity using ACCESS_TOKEN_SECRET
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // 3 - Find user from database
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        // 4 - Attach user object to 'req' so next controller can use it
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid or expired access token")
    }
});