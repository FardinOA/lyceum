const express = require("express");
const router = express.Router();

const {
    registerUser,
    confirmOTP,
    login,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    getUserInfo,
    getUser,
    followUser,
    getAllFolowers,
    getAllFolowing,
    unFollowUser,
    createPost,
    createComment,
    deleteComment,
    editComment,
    editPost,
    getAllPostByUser,
    getPost,
    likeAPost,
    getAllPost,
} = require("../controllers/userController");

const validator = require("../../middlewares/validator");
const { isAuth } = require("../../middlewares/auth");

router.post("/register", validator("register"), registerUser);
router.post("/confirm-otp", confirmOTP);
router.post("/login", validator("login"), login);
router.get("/logout", logout);
router.post(
    "/updatePassword",
    isAuth,
    validator("updatePasswordValidator"),
    updatePassword
);

router.post("/forgotPassword", validator("emailValidator"), forgotPassword);
router.put(
    "/password/reset/:token",
    validator("resetPasswordValidator"),
    resetPassword
);

router.get("/user", isAuth, getUserInfo);
router.get("/user/:id", getUser);

router.post("/follow/:id", isAuth, followUser);
router.get("/follower", isAuth, getAllFolowers);
router.get("/following", isAuth, getAllFolowing);
router.post("/unfollow/:id", isAuth, unFollowUser);

// route for post

router.post("/create-post", isAuth, createPost);
router.post("/create-comment/:postId", isAuth, createComment);
router.put("/delete-comment", isAuth, deleteComment);
router.put("/edit-comment/:commentId", isAuth, editComment);
router.put("/edit-post/:postId", isAuth, editPost);
router.get("/get-all-post-byUser", getAllPostByUser);
router.get("/get-post/:postId", getPost);
router.put("/like-post/:postId", isAuth, likeAPost);
router.get("/get-all-post", isAuth, getAllPost);

module.exports = router;
