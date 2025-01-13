import express from "express";
const router = express.Router();
import formidable from "express-formidable";

// Middleware
import { requireSignin, canEditDeletePost, isAdmin } from "../middlewares";

// Controllers
import { createPost, updatePost, deletePost, uploadImage, postsByUser, allPosts, userPost, newsFeed, likePost, unlikePost, addComment, removeComment, totalPosts, posts, getPost } from "../controllers/post";

router.post("/create-post", requireSignin, createPost);
router.post("/upload-image", requireSignin, formidable({maxFileSize: 5 * 1024 * 1024}), uploadImage);
router.get("/user-posts", requireSignin, postsByUser)
router.get("/user-post/:_id", requireSignin, userPost)
router.get("/all-posts", requireSignin, allPosts)
router.put("/update-post/:_id", requireSignin, canEditDeletePost, updatePost)
router.delete("/delete-post/:_id", requireSignin, canEditDeletePost, deletePost)

router.get("/news-feed/:page", requireSignin, newsFeed)

router.put("/like-post", requireSignin, likePost);
router.put("/unlike-post", requireSignin, unlikePost);
router.put("/add-comment", requireSignin, addComment);
router.put("/remove-comment", requireSignin, removeComment);
router.get("/total-posts", requireSignin, totalPosts);
router.get("/posts", posts);
router.get("/post/:_id", getPost);

// admin
router.delete("/admin/delete-post/:_id", requireSignin, isAdmin, deletePost)

module.exports = router;