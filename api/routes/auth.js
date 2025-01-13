import express from "express";

const router = express.Router();

// controllers
import { register, login, currentUser, forgotPassword, profileUpdate, findPeople, addFollower, userFollow, removeFollower, userUnfollow, userFollowing, searchUser, getUser } from "../controllers/auth";

// middlewares
import { isAdmin, requireSignin } from "../middlewares";

router.post("/register", register)
router.post("/login", login)
router.get("/current-user", requireSignin, currentUser)
router.post("/forgot-password", forgotPassword)
router.put("/profile-update", requireSignin, profileUpdate )
router.get("/find-people", requireSignin, findPeople)
router.put("/user-follow", requireSignin, addFollower, userFollow)
router.put("/user-unfollow", requireSignin, removeFollower, userUnfollow)
router.get("/user-following", requireSignin, userFollowing)
router.get("/search-user/:query", requireSignin, searchUser)
router.get("/user/:username", getUser)

router.get("/current-admin", requireSignin, isAdmin, currentUser)

module.exports = router;