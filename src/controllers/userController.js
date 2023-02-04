const sendEmail = require("../../utils/sendEmail");
// import { sendEmail } from "../../utils/sendEmail";
const userModel = require("../models/userModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const sendToken = require("../../utils/sendLoginToken");
const createHttpError = require("http-errors");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const ErrorHandeler = require("../../utils/errorHandeler");
const catchAssyncErrors = require("../../middlewares/catchAssyncErrors");
const Notification = require("../models/notificationModel");

const cloudinary = require("cloudinary").v2;

exports.registerUser = catchAssyncErrors(async (req, res, next) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpires = Date.now() + 15 * 60 * 1000;

    const user = await User.create({ ...req.body, otp, otpExpires });

    if (!user) return next(new ErrorHandeler("Can't Register", 400));
    try {
        await sendEmail({
            email: user.email,
            subject: "Welcomme to the Lyceum",
            message: `Welcome ${user.firstName}. Your OTP is ${user.otp}. Please visit https://lyceum-frontend.vercel.app/verification `,
        });
    } catch (err) {
        return next(new ErrorHandeler(err.message, 500));
    }

    res.status(200).json({
        email: user.email,
        success: true,
        message: "Please check your email for varification",
    });
});

exports.confirmOTP = catchAssyncErrors(async (req, res, next) => {
    const { otp, email } = req.body;

    const user = await User.findOne({
        email,
        otpExpires: { $gt: Date.now() },
    });

    if (!user)
        return next(new ErrorHandeler("Your otp is wrong or expired", 404));

    if (user.otp != otp)
        return next(new ErrorHandeler("Your otp is wrong or expired", 401));

    user.isVerified = true;
    user.otpExpires = undefined;
    user.otp = "";

    await user.save();

    res.status(200).json({
        message: "Your account verification was successful",
    });
});

exports.login = catchAssyncErrors(async (req, res, next) => {
    const { email, password, admin } = req.body;
    if (!email || !password) {
        return next(new ErrorHandeler("Please Enter Email & Password", 400));
    }
    let user;
    if (admin) {
        user = await User.findOne({
            email,
            isVerified: true,
            isDeleted: false,
            banned: false,
            role: "admin",
        });
    } else {
        user = await User.findOne({
            email,
            isVerified: true,
            isDeleted: false,
            banned: false,
            role: "user",
        });
    }

    if (!user) {
        return next(new ErrorHandeler("Invalid Email or Password", 400));
    }

    if (!(await user.comparePassword(password))) {
        return next(new ErrorHandeler("Invalid Email or Password", 401));
    }

    sendToken(user, 200, res);
});

// logout user
exports.logout = catchAssyncErrors(async (req, res, next) => {
    res.cookie("cookieToken", null, {
        expires: new Date(Date.now()),
        // httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.clearCookie("cookieToken");
    res.status(200).json({
        success: true,
        message: "User logged out",
    });
});

exports.updatePassword = catchAssyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    const isPassMatch = await user.comparePassword(req.body.currentPassword);
    if (!isPassMatch) {
        return next(new ErrorHandeler("Invalid Password", 401));
    }

    if (req.body.newPassword != req.body.confirmNewPassword) {
        return next(new ErrorHandeler("Password does not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

exports.forgotPassword = catchAssyncErrors(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandeler("User not found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    user.save({ validateBeforeSave: true });
    // const resetPasswordUrl = `${req.protocol}://${req.get(
    //     "host"
    // )}/password/reset/${resetToken}`;

    const resetPasswordUrl = `https://lyceum-frontend.vercel.app/password/reset/${resetToken}`;

    const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\nif you have not requested this email then, Please ignore it`;
    try {
        await sendEmail({
            email: user.email,
            subject: `Lyceum Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        const user = await User.findOne({ email: req.body.email });
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.save({ validateBeforeSave: false });
        return next(new ErrorHandeler(err.message, 500)());
    }
});

exports.resetPassword = catchAssyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandeler(
                "Reset Password Token is Invalid or has been expired",
                400
            )
        );
    }

    if (req.body.newPassword !== req.body.confirmNewPassword) {
        return next(new ErrorHandeler("Password does not match", 400));
    }
    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(201).json({ message: "Reset Password Successful" });
});

exports.updateUserInfo = catchAssyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone } = req.body;
    if (!firstName && !lastName && !email && !phone) {
        return next(new ErrorHandeler("Please give some information", 400));
    }

    let newObj;

    newObj = {
        ...req.body,
    };

    const user = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
            $set: newObj,
        },
        {
            multi: true,
        }
    );
    res.status(200).json({ message: "User updated successfully" });
});

exports.banUser = catchAssyncErrors(async (req, res, next) => {
    const _id = req.params.id;

    const newObj = {
        banned: true,
    };

    const is = await User.findByIdAndUpdate(
        { _id },
        {
            $set: newObj,
        },
        {
            multi: true,
        }
    );

    if (!is) return next(new ErrorHandeler("Something Went Wrong", 500));
    const user = await User.findOne({ _id });
    res.status(200).json({
        user,
        message: `${user.lastName}'s Account is Banned successfully`,
    });
});

exports.UnBanUser = catchAssyncErrors(async (req, res, next) => {
    const _id = req.params.id;

    const newObj = {
        banned: false,
    };

    const is = await User.findByIdAndUpdate(
        { _id },
        {
            $set: newObj,
        },
        {
            multi: true,
        }
    );

    if (!is) return next(new ErrorHandeler("Something Went Wrong", 500));
    const user = await User.findOne({ _id });
    res.status(200).json({
        user,
        message: `${user.lastName}'s Account is Un-Banned successfully`,
    });
});

// delete user
exports.deleteUser = catchAssyncErrors(async (req, res, next) => {
    const _id = req.params.id;

    const newObj = {
        isDeleted: true,
    };

    const is = await User.findByIdAndUpdate(
        { _id },
        {
            $set: newObj,
        },
        {
            multi: true,
        }
    );

    if (!is) return next(new ErrorHandeler("Something Went Wrong", 500));
    const user = await User.findOne({ _id });
    res.status(200).json({
        user,
        message: `${user.lastName}'s Account Is Deleted`,
    });
});

exports.unDeleteUser = catchAssyncErrors(async (req, res, next) => {
    const _id = req.params.id;

    const newObj = {
        isDeleted: false,
    };

    const is = await User.findByIdAndUpdate(
        { _id },
        {
            $set: newObj,
        },
        {
            multi: true,
        }
    );

    if (!is) return next(new ErrorHandeler("Something Went Wrong", 500));
    const user = await User.findOne({ _id });
    res.status(200).json({
        user,
        message: `${user.lastName}'s Account Is Revived`,
    });
});

exports.getUserInfo = catchAssyncErrors(async (req, res, next) => {
    if (!req.user?.id)
        return next(new ErrorHandeler("Please log in first", 403));

    const user = await User.findOne({
        _id: req.user._id,
        isVerified: true,
        isDeleted: false,
        banned: false,
    }).populate("allPosts");

    if (!user)
        return next(
            new ErrorHandeler("Your account is Banned or Deleted", 403)
        );

    const secureUser = user.toObject();
    delete secureUser.password;
    JSON.stringify(secureUser);

    res.status(200).json({
        success: true,
        user: secureUser,
    });
});

exports.getAllPostByUser = catchAssyncErrors(async (req, res, next) => {
    const cntPost = await Post.find();
    const posts = await Post.find({ postedBy: req.query.userId })
        .populate("postedBy")
        .skip(req.query.skip)
        .limit(10)
        .sort({ createdAt: -1 });

    res.status(200).json({
        posts,
        cnt: cntPost.length,
    });
});

exports.getAllUsers = catchAssyncErrors(async (req, res, next) => {
    const cntUser = await User.find();
    const users = await User.find({ role: "user" })
        .skip(req.query.skip)
        .limit(20)
        .sort({ createdAt: -1 });

    res.status(200).json({
        users,
        cnt: cntUser.length,
    });
});

exports.getAllPost = catchAssyncErrors(async (req, res, next) => {
    const cntPost = await Post.find();
    const posts = await Post.find()
        .populate("postedBy")
        .skip(req.query.skip)
        .limit(10)
        .sort({ createdAt: -1 });

    res.status(200).json({
        posts,
        cnt: cntPost.length,
    });
});

exports.getUser = catchAssyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandeler("Please log in first", 403));

    const secureUser = user.toObject();
    delete secureUser.password;
    JSON.stringify(secureUser);

    res.status(200).json({
        success: true,
        user: secureUser,
    });
});

exports.getUsers = catchAssyncErrors(async (req, res, next) => {
    // const user = req.body.ids;
    // const userId = user?.filter((id) => id != req.user.id);
    // if (user.length < 1) res.status(200).json({ message: "no active user" });
    // const ck = [
    //     ...new Set([
    //         ...req.body.user.follower,
    //         ...req.body.user.following,
    //         ...userId,
    //     ]),
    // ];

    // let final = [];

    // for (let i = 0; i < ck.length; i++) {
    //     for (let j = 0; j < userId.length; j++) {
    //         if (userId[j] == ck[i]) final.push(userId[j]);
    //     }
    // }

    // const users = await User.find({ _id: final });

    // if (!users) return next(new ErrorHandeler("Please log in first", 403));
    // let activeUsers = [];

    // if (Array.isArray(users)) activeUsers = [...users];
    // else activeUsers.push(users);

    const activeUsers = await User.find({ _id: req.body.arr });

    res.status(200).json({
        success: true,
        data: activeUsers,
    });
});

// exports.createPost = catchAssyncErrors(async (req, res, next) => {
//     const post = await Post.create({ ...req.body });
//     const user = await User.findByIdAndUpdate({});
//     if (!post) return next(ErrorHandeler("Can't Create a Post", 400));

//     res.status(200).json({
//         success: true,
//         message: "Post created successfully",
//     });
// });

exports.followUser = catchAssyncErrors(async (req, res, next) => {
    const user = await User.findOne({
        _id: req.params.id,
        isVerified: true,
        isDeleted: false,
        banned: false,
    });
    if (!user) {
        return next(
            new ErrorHandeler(
                "User you are trying to follow is not available",
                404
            )
        );
    }

    // logic for me follow to others
    const success = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
            $addToSet: { following: user._id },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    const success2 = await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
            $addToSet: { follower: req.user._id },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!success || !success2) {
        return next(new ErrorHandeler("Something Went wrong", 500));
    }

    res.status(200).json({
        success: true,
        message: `${user.firstName} added to your follower list`,
    });
});

exports.getAllFolowers = catchAssyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate("follower");

    res.status(200).json({
        success: true,
        following: user.following,
        follower: user.follower,
    });
});

exports.getAllFolowing = catchAssyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate("following");

    res.status(200).json({
        success: true,
        following: user.following,
        follower: user.follower,
    });
});

exports.unFollowUser = catchAssyncErrors(async (req, res, next) => {
    const success = await User.findByIdAndUpdate(
        {
            _id: req.user._id,
        },
        {
            $pull: { following: req.params.id },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    const success2 = await User.findByIdAndUpdate(
        {
            _id: req.params.id,
        },
        {
            $pull: { follower: req.user._id },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!success || !success2)
        return next(new ErrorHandeler("This user is not your follower", 404));

    res.status(201).json({
        success: true,
        message: "Unfollow user successfully",
    });
});

exports.createPost = catchAssyncErrors(async (req, res, next) => {
    const myCloud = await cloudinary.uploader.upload(req.body.image, {
        folder: "avatars",
    });
    const post = await Post.create({
        ...req.body,
        postedBy: req.user._id,
        image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

    if (!post) {
        return next(new ErrorHandeler("Can't Create Post", 400));
    }

    const savePost = await User.updateOne(
        { _id: req.user._id },
        {
            $push: { allPosts: post._id },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!savePost) {
        return next(new ErrorHandeler("Can't Create Post", 400));
    }

    res.status(201).json({
        success: true,
        message: "Post created successfully",
    });
});
exports.createComment = catchAssyncErrors(async (req, res, next) => {
    const comment = await Comment.create({
        ...req.body,
        commentBy: req.user._id,
    });

    if (!comment) {
        return next(new ErrorHandeler("Can't create comment", 400));
    }
    const success = await Post.findByIdAndUpdate(
        { _id: req.params.postId },
        {
            $push: { comments: comment._id },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!success) {
        return next(new ErrorHandeler("Can't create comment", 400));
    }
    const post = await Post.findById(req.params.postId);

    const notification = await Notification.create({
        ownar: post.postedBy,
        post: req.params.postId,
        notificationBy: req.user._id,
        message: `${req.user.firstName} comment on your post`,
    });

    res.status(201).json({
        success: true,
        message: "Comment successfully",
        comment,
    });
});

exports.deleteComment = catchAssyncErrors(async (req, res, next) => {
    const { postId, commentId } = req.query;

    const deleteFromCommentSchema = await Comment.findOneAndDelete({
        _id: commentId,
        commentBy: req.user._id,
    });
    if (!deleteFromCommentSchema)
        return next(new ErrorHandeler("Can't delete comment", 400));

    const deleteFromPostSchema = await Post.findByIdAndUpdate(
        { _id: postId },
        {
            $pull: {
                comments: commentId,
            },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!deleteFromPostSchema)
        return next(new ErrorHandeler("Can't delete comment", 400));

    res.status(200).json({
        success: true,
        message: "Comment successfully deleted",
    });
});

exports.editComment = catchAssyncErrors(async (req, res, next) => {
    const success = await Comment.findByIdAndUpdate(
        { _id: req.params.commentId },
        {
            $set: {
                text: req.body.text,
            },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!success) {
        return next(new ErrorHandeler("Can't update this comment", 400));
    }
    res.status(200).json({
        success: true,
        message: "Comment update successfully",
    });
});

exports.editPost = catchAssyncErrors(async (req, res, next) => {
    const { links, tags, images, description } = req.body;
    const success = await Post.findByIdAndUpdate(
        { _id: req.params.postId },
        {
            $addToSet: { tags, images, links },
            $set: { description },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!success) {
        return next(new ErrorHandeler("Can't update post", 400));
    }
    res.status(200).json({
        success: true,
        message: "Post update successfully",
    });
});

exports.getPost = catchAssyncErrors(async (req, res, next) => {
    const post = await Post.findById(req.params.postId)
        .populate("postedBy")
        .populate("comments");

    if (!post) {
        return next(new ErrorHandeler("Can't find post", 404));
    }

    res.status(200).json({
        success: true,
        post,
    });
});

exports.likeAPost = catchAssyncErrors(async (req, res, next) => {
    const success = await Post.findByIdAndUpdate(
        { _id: req.params.postId },
        {
            $addToSet: { likes: req.user._id },
        },
        {
            multi: true,
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );

    if (!success) {
        return next(new ErrorHandeler("Can't Like post", 404));
    }
    res.status(200).json({
        success: true,
        post: success,
    });
});

exports.uploadProfileimage = catchAssyncErrors(async (req, res, next) => {
    const myCloud = await cloudinary.uploader.upload(req.body.image, {
        folder: "avatars",
    });

    const user = await User.findById(req.user._id);
    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: "Image Uploaded Successfully",
    });
});

exports.getAllNotification = catchAssyncErrors(async (req, res, next) => {
    const notificationCnt = await Notification.find({
        ownar: req.query.userId,
    });
    const notification = await Notification.find({
        ownar: req.query.userId,
    })
        .skip(req.query.skip)
        .limit(10)
        .sort({
            createdAt: -1,
        });

    res.status(200).json({
        notification,
        cnt: notificationCnt.length,
    });
});

exports.getUserID = catchAssyncErrors(async (req, res, next) => {
    if (!req.user?.id)
        return next(new ErrorHandeler("Please log in first", 403));
    res.status(200).json({
        id: req.user._id,
    });
});

// exports.getConversation = catchAssyncErrors(async (req, res, next) => {
//     if (!req.user?.id)
//         return next(new ErrorHandeler("Please log in first", 403));

//     const conversations = await Conversation.findById(req.user._id);
//     res.status(200).json({
//         conversations,
//     });
// });
