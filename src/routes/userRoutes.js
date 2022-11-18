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
    uploadProfileimage,
    getAllNotification,
    getUserID,
    getUsers,
    updateUserInfo,
    getAllUsers,
    banUser,
    UnBanUser,
    deleteUser,
    unDeleteUser,
} = require("../controllers/userController");

const validator = require("../../middlewares/validator");
const { isAuth, authRole } = require("../../middlewares/auth");

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
router.put("/updateUserInfo", isAuth, updateUserInfo);

router.get("/user", isAuth, getUserInfo);
router.get("/user/:id", getUser);
router.post("/users", getUsers);

router.post("/follow/:id", isAuth, followUser);
router.get("/follower", isAuth, getAllFolowers);
router.get("/following", isAuth, getAllFolowing);
router.post("/unfollow/:id", isAuth, unFollowUser);
router.get("/userId", isAuth, getUserID);
router.put("/banUser/:id", isAuth, authRole("admin"), banUser);
router.put("/UnBanUser/:id", isAuth, authRole("admin"), UnBanUser);
router.put("/deleteUser/:id", isAuth, authRole("admin"), deleteUser);
router.put("/unDeleteUser/:id", isAuth, authRole("admin"), unDeleteUser);

// route for post

router.post("/create-post", isAuth, createPost);
router.post("/create-comment/:postId", isAuth, createComment);
router.put("/delete-comment", isAuth, deleteComment);
router.put("/edit-comment/:commentId", isAuth, editComment);
router.put("/edit-post/:postId", isAuth, editPost);
router.get("/get-all-post-byUser", getAllPostByUser);
router.get("/get-all-users", isAuth, authRole("admin"), getAllUsers);
router.get("/get-post/:postId", getPost);
router.put("/like-post/:postId", isAuth, likeAPost);
router.get("/get-all-post", isAuth, getAllPost);
router.post("/edit-profile-image", isAuth, uploadProfileimage);

// notification
router.get("/all-notification", getAllNotification);

module.exports = router;
