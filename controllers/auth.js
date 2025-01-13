import User from "../models/user";
import { hashPassword, comparePassword } from "../helpers/auth";
import jwt from "jsonwebtoken"
import nanoid from "nanoid";

export const register = async (req, res)=>{
    console.log("Request enpoint hit =====> ", req.body)
    const {name, email, password, secret} = req.body;
    // Validation
    if(!name){
        return res.json({error:'Name is required'});
    }
    if(!password || password.length < 6){
        return res.json({error:'Password is required and should be minimum of six characters long'});
    }
    if(!secret){
        return res.json({error:'Answer is required'});
    }
    const exist = await User.findOne({email});
    if(exist){
        return res.json({error:"That email is already taken."})
    }
    const hashedPassword = await hashPassword(password);
    const user = new User({ name, email, password: hashedPassword, secret, username: nanoid(6) });
    try {
        await user.save();
        return res.json({ ok: true })
    } catch(err){
        console.log(err)
        return res.status(400).send("Error, Try again");
    }
}

export const login = async (req,res) =>{
    try{
        const {email, password} = req.body;
        // check if our db has user with that email
        const user = await User.findOne({email});
        if(!user){
            return res.json({error:"No user found"});
        }
        // check password
        const match = await comparePassword(password, user.password);
        if(!match){
            return res.json({error:"Wrong credentials"})
        }
        // create signed token
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn:"7d"});
        user.password = undefined;
        user.secret = undefined;
        return res.json({
            token,
            user
        })
    } catch(err){
        console.log(err);
        return res.status(400).send("Error try again")
    }
}


export const currentUser = async (req, res) => {
    try{
        const user = await User.findById(req.auth._id);
        user.password = undefined;
        user.secret = undefined;
        return res.json( { ok: true, user: user } )
    }catch(err){
        console.log(err);
        res.status(401);
    }
}


export const forgotPassword = async (req, res) => {
    console.log(req.body)
    const { email, newPassword, secret } = req.body;
    // validation
    if(!newPassword || newPassword.length < 6){
        return res.json({
            error: "New password is required and should be minimum 6 characters long"
        })
    }
    if(!secret){
        return res.json({
            error:"Secret is required."
        })
    }
    const user = await User.findOne({email, secret});
    if(!user) {
        return res.json({
            error:"We cannot verify its you"
        });
    }
    try {
        const hashed = await hashPassword(newPassword);
        await User.findOneAndUpdate({_id:user._id}, {password: hashed})
        return res.json({
            success:"Congrats! now you can login with your new password"
        })
    }catch(err){
        console.log(err);
        return res.json({
            error:"Something went wrong. Try again."
        })
    }
}

export const profileUpdate = async (req, res) => {
    try{
        // console.log("Profile update request body => ", req.body);
        const data = {};
        if(req.body.username){
            data.username = req.body.username;
        }
        if(req.body.about){
            data.about = req.body.about;
        }
        if(req.body.name){
            data.name = req.body.name;
        }
        if(req.body.password){
            if(req.body.password.length < 6){
                return res.json({error: "Password is required and should be minimum six characters long."})
            }
            else{
                data.password = await hashPassword(req.body.password);
            }
        }
        if(req.body.secret){
            data.secret = req.body.secret;
        }
        if(req.body.image){
            data.image = req.body.image;
        }
        let user = await User.findByIdAndUpdate(req.auth._id, data, {new:true})
        console.log("Updated user ", user)
        user.password = undefined;
        user.secret = undefined;
        res.json(user);
    }
    catch(err){
        if(err.code === 11000){
            return res.json({error: "Username is taken. Please try something else."})
        }
        console.log(err);
    }
}

export const findPeople = async (req, res) => {
    try{
        const user = await User.findById(req.auth._id);
        let following = user.following;
        following.push(user._id);
        const people = await User.find({_id: {$nin: following}}).select('-password -secret').limit(10);
        res.json(people);
    }catch(err){
        console.log(err);
    }
}


export const addFollower = async (req, res, next) => {
    try{
        const user = await User.findByIdAndUpdate(req.body._id, {
            $addToSet: {followers: req.auth._id}
        });
        next();
    }catch(err){
        console.log(err);
        return res.status(400).json({success: false, message: 'Error while adding follower'});
    }
    
}
export const userFollow = async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(req.auth._id, {
            $addToSet: {following: req.body._id}
        }, {new: true}).select('-password -secret');
        return res.json(user)
    }catch(err){
        console.log(err);
        return res.status(400).json({success: false, message: 'Error while adding following'});
    }
}
export const userFollowing = async (req, res) => {
    try{
        const user = await User.findById(req.auth._id);
        const following = await User.find({_id: user.following}).select('-password -secret').limit(100);
        return res.json(following);
    }catch(err){
        console.log(err);
        return res.status(400).json({success: false, message: 'Error while adding following'});
    }
}
// middleware
export const removeFollower = async (req, res, next) => {
    try{
        const user = await User.findByIdAndUpdate(req.body._id, {
            $pull: {followers: req.auth._id}
        })
        next();
    }catch(err){
        console.log(err);
    }
}

export const userUnfollow = async (req, res) => {
    try{
        const user = await User.findByIdAndUpdate(req.auth._id, {
            $pull: {following: req.body._id},
        }, {new: true}).select('-password -secret');
        res.json(user);
    }catch(err){
        console.log(err);
    }
}
export const searchUser = async (req, res) => {
    const {query} = req.params;
    if(!query) return res.json([]);
    try{
        const user = await User.find({
            $or: [{name: {$regex: query, $options: 'i'}}, {username:{$regex: query, $options: 'i'} }]
        }).select('-password -secret');
        res.json(user);
    }catch(err){
        console.log(err);
    }
}
export const getUser = async (req, res) => {
    const {username} = req.params;
    if(!username) return res.json({});
    try{
        const user = await User.findOne({username}).select("-password -secret");
        res.json(user);
    }catch(err){
        console.log(err);
    }
}
