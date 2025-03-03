const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const userAuth = async (req,res,next) => {
    try {
        //Read the token from the request cookies,
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({ message: "No token, please login" });
        }
        // validate the token,
        const decodedObj = await jwt.verify(token,process.env.JWT_TOKEN);    
        console.log(decodedObj);
        // find the user
        const {_id} = decodedObj;
        const user = await User.findById(_id);
        if(!user){
            throw new Error("User not found.");
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(400).send("ERROR: "+error.message);
    }
}

//auth for admin
const adminAuth = async(req,res,next) => {
    try {
        //Read the token from the request cookies,
        const {adminToken} = req.cookies;
        if(!adminToken){
            return res.status(401).json({ message: "No token, please login" });
        }
        // validate the token,
        const decodedObj = await jwt.verify(adminToken,process.env.JWT_TOKEN);    
        console.log(decodedObj);
        // find the user
        const {_id} = decodedObj;
        const user = await User.findById(_id);
        if(!user){
            throw new Error("User not found.");
        }

        if(!user.isAdmin){
            return res.status(403).json({message: "Access denied.Admins only. "});
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).send("ERROR: "+error.message);
    }
}

module.exports = {
    userAuth,
    adminAuth,
}