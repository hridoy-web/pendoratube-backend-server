import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, // ইউজারের ইনপুট স্বয়ংক্রিয়ভাবে ছোট হাতের অক্ষরে রূপান্তর করবে
            trim: true, // টেক্সটের আগে বা পিছনের অতিরিক্ত স্পেস মুছে ফেলবে
            index: true // সার্চিং পারফরম্যান্স দ্রুত করার জন্য ডাটাবেজ ইনডেক্সিং যুক্ত করবে
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true
        },
        avatar: {
            type: String, // URL
            required: true
        },
        coverImage: {
            type: String 
        },
        watchHistory: [{
            type: Schema.Types.ObjectId, // অন্য ডাটাবেজ ডকুমেন্টের ইউনিক আইডি
            ref: "Video" // Video মডেলের সাথে রিলেশনশিপ (যাতে ইউজার কোন ভিডিওগুলো দেখেছে তা ট্র্যাক করা যায়)
        }],
        password: {
            type: String,
            required: [true, 'Password is Required'] // কাস্টম এরর মেসেজসহ পাসওয়ার্ড (যা পরবর্তীতে হ্যাশ করে সেভ হবে)
        },
        refreshToken: {
            type: String // ইউজারের সক্রিয় সেশন ধরে রাখা ও নতুন একসেস টোকেন ইস্যু করার গোপন টোকেন
        }
    },
    { 
        timestamps: true
    }
);

// --------------------------------------------------------------------------
// ১. PASSWORD HASHING (ডাটাবেজে সেভ হওয়ার ঠিক আগে পাসওয়ার্ড এনক্রিপ্ট করা)
// --------------------------------------------------------------------------
userSchema.pre("save", async function (next) {
    // পাসওয়ার্ড যদি পরিবর্তন বা নতুন তৈরি না হয় (যেমন: ইউজার শুধু নাম আপডেট করল), তবে হ্যাশ করার দরকার নেই
    if (!this.isModified("password")) {
        return next();
    }

    // পাসওয়ার্ডটি ১০ বার অ্যালগরিদম ঘুরিয়ে অস্পষ্ট ও সুরক্ষিত (Hash) করে ফেলা হচ্ছে
    this.password = await bcrypt.hash(this.password, 10);

    // কাজ শেষ, এখন ডাটাবেজে সেভ হতে দাও
    next();
});

// --------------------------------------------------------------------------
// ২. PASSWORD CHECKING (লগইনের সময় ইউজার সঠিক পাসওয়ার্ড দিয়েছে কিনা মেলানো)
// --------------------------------------------------------------------------
userSchema.methods.isPasswordCorrect = async function (password) {
    // ইউজারের টাইপ করা পাসওয়ার্ড (Plain Text) এবং ডাটাবেজের হ্যাশ পাসওয়ার্ড তুলনা করে true/false দেবে
    return await bcrypt.compare(password, this.password);
};

// --------------------------------------------------------------------------
// ৩. GENERATE ACCESS TOKEN (শর্ট-টার্ম টিকিট বা রিস্টব্যান্ড তৈরি করা)
// --------------------------------------------------------------------------
userSchema.methods.generateAccessToken = function () {
    // jwt.sign() দিয়ে একটি নতুন ডিজিটাল টিকিট (JWT Token) বানানো হচ্ছে
    return jwt.sign(
        {
            // টোকেনের ভেতরে অল্প কিছু প্রয়োজনীয় তথ্য (Payload) রাখা হচ্ছে
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET, // গোপন চাবি যা দিয়ে টোকেনটি লক করা হবে
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // কতক্ষণ পর এই টিকিট বাতিল হবে (যেমন: 1d)
        }
    );
};

// --------------------------------------------------------------------------
// ৪. GENERATE REFRESH TOKEN (লং-টার্ম কার্ড তৈরি করা)
// --------------------------------------------------------------------------
userSchema.methods.generateRefreshToken = function () {
    // এটি শুধু ইউজারকে চেনার জন্য একমাত্র ID দিয়ে একটি টোকেন তৈরি করে
    return jwt.sign(
        {
            _id: this._id // রিফ্রেশ টোকেনে বেশি তথ্য রাখা হয় না, শুধু ID রাখা হয়
        },
        process.env.REFRESH_TOKEN_SECRET, // রিফ্রেশ টোকেনের আলাদা গোপন চাবি
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // এটি অনেকদিন মেয়াদী হয় (যেমন: 10d)
        }
    );
};

export const User = mongoose.model("User", userSchema);