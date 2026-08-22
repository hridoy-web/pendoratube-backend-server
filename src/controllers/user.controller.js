import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// Helper Function: Access or Refresh Token
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating accessToken tokens and refresh token')
    }
};

const registerUser = asyncHandler(async (req, res) => {

    // N0: 01 - Get user details from frontend
    const { fullName, username, email, password } = req.body;

    // N0: 02 - Validation check if fields are empty
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // N0: 03 - Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }

    // NO: 04 - check avatar image from multer
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    // cover image optional
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // NO: 05 - Upload files to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = null;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar image")
    }

    // NO: 06 - Create user object in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // NO: 07 - Remove sensitive fields before sending response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // N0: 08 - if user not create throw error
    if (!createdUser) {
        throw new ApiError(500, "Something Went Wrong while registering user!");
    }

    // NO: 09 - Send Response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {

    // 1 - req.body > get data
    const { email, username, password } = req.body;

    // 2 - Validation
    if ((!username && !email) || !password) {
        throw new ApiError(400, "Username/Email and password are required");
    }

    // 3 - Find user in database
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, 'user does not exist')
    }

    // 4 - Password Verification
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials');
    }

    // 5: Generate Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Cookie Security Options
    const options = {
        httpOnly: true,
        secure: true
    };

    // 6 - send response with cookies
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                'user logged in successfully'
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {

})

export { registerUser, loginUser };