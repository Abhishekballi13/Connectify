const express = require("express");
const profileRouter = express.Router();
const {userAuth} = require("../middlewares/auth")
const {validateEditProfileData,validateUpdatedPassword} = require("../utils/validation");
const bcrypt = require("bcrypt");

//profile
profileRouter.get("/profile/view",userAuth,async(req,res)=>{
    try{
         const user = req.user;
         res.send(user); 
     }catch(err){
         res.status(400).send("ERROR : "+err.message);
     }
 })

//profile update
profileRouter.patch("/profile/edit",userAuth,async (req,res) => {
   try{ 
    if(!validateEditProfileData(req)){
        throw new Error("Invalid Edit Request");
    }
    
    //getting user from userAuth
    const loggedInUser = req.user;
    
    Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key]);
    
    //logged in user instance we have
    await loggedInUser.save();

    res.json({
        message : `${loggedInUser.firstName},your profile updated successfully`,
        data : loggedInUser,
    });

   }catch(err){
     res.status(400).send("ERROR : "+err.message);
   }
})

//profile ,forgot password
profileRouter.patch("/profile/forgotPassword",userAuth,async (req,res) => {
    try{
        if(!validateUpdatedPassword(req)){
           throw new Error("Password is not strong!!");
        }

        const {password} = req.body;

        const updatedPasswordHash = await bcrypt.hash(password,10);

        const loggedInUser = req.user;

        // Object.keys(req.body).forEach(key => loggedInUser[key]=updatedPasswordHash);
        loggedInUser.password = updatedPasswordHash;

        await loggedInUser.save();

        res.json({
            message : `${loggedInUser.firstName},your password has been updated successfully.`,
            data : loggedInUser,
        })

    }catch(err){
      res.status(400).send("ERROR : "+err.message);
    }
})

module.exports = profileRouter;