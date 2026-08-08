import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // URL https://res.cloudinary.com
            required: true,
        },
        thumbnail: {
            type: String, // URL
            required: true,
        },
        title: {
            type: String, 
            required: true,
        },
        description: {
            type: String, 
            required: true,
        },
        duration: {
            type: Number, 
            required: true,
        },
        views: {
            type: Number,
            default: 0, // নতুন ভিডিও আপলোড হলে ভিউ সংখ্যা ০ থেকে শুরু হবে
        },
        isPublished: {
            type: Boolean, // ভিডিওটি সবার জন্য দেখা যাবে (Public) নাকি লুকানো (Private) থাকবে
            default: true, // বাই-ডিফল্ট আপলোড করলেই পাবলিশড অবস্থায় থাকবে
        },
        owner: {
            type: Schema.Types.ObjectId, // ডাটাবেজে ইউজার টেবিলের নির্দিষ্ট আইডি (Relational ID)
            ref: "User", // কোন ইউজার এই ভিডিওটি আপলোড করেছে তার ইউজার মডেলের সাথে সংযোগ (Link/Relation)
        },
    },
    { 
        timestamps: true
    }
);

// ২. জটিল ক্যোয়ারি ও পেজিনেশন (Pagination) সহজ করার জন্য প্লাগইন যুক্ত করা
// (এর ফলে ১০টি বা ২০টি করে ভিডিও ধাপে ধাপে পেজ আকারে ফ্রন্টএন্ডে পাঠাতে সুবিধা হবে)
videoSchema.plugin(mongooseAggregatePaginate);

// ৩. Mongoose Model তৈরি এবং এক্সপোর্ট করা
export const Video = mongoose.model("Video", videoSchema);