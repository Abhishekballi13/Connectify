const express = require("express");
const authRouter = express.Router();
const {User} = require("../models/user");
const {validateSignupData,validateLoginData} = require("../utils/validation");
const bcrypt = require("bcrypt");

//Router and app have almost same logic
//so app.use() and authRouter.use() are almost same,they are same thing

//signup api
authRouter.post("/signup",async (req,res)=>{
    try{ 
        //1. validation of data , 
        validateSignupData(req);

        const {firstName,lastName,emailId,password,skills,photoUrl} = req.body;

        // 2.Encrypt the password
        const passwordHash = await bcrypt.hash(password,10);
        
        //creating a new instance of this User model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password:passwordHash,
            skills,
            photoUrl,
        });

        //data will get saved on db,it will return us a promise
        const savedUser = await user.save();
        const token = await user.getJWT();
 
         //Add the token to cookie 
        res.cookie("token",token,{sameSite:"None",httpOnly:true,secure:true,expires:new Date(Date.now() + 7*24*3600000),});
        
        //send the response back to user
        res.json({message:"User Added Successfully!",data:savedUser});

    }catch(err){
        res.status(400).send("Error saving the user:"+err.message);
    }
  
});

//login api
authRouter.post("/login",async (req,res)=>{
    try{
     validateLoginData(req);
      const {emailId,password} = req.body;
      //first checking wether email id is present is database or not
      //wether there is user or not
      //then we check the password entered and the one present in db
      //if both of them are matching then login Successfull
      const user = await User.findOne({emailId:emailId});
      if(!user){
         //dont expose your data by telling email id not present in db
         // throw new Error("EmailId is not present in DB");
 
         //just tell invaid credentials
         throw new Error("Invalid Credentials");
      }
      const isPasswordValid = await user.checkPassword(password);
 
      if(isPasswordValid){
         //Create a JWT Token
         //offloaded our logic to schema methods
         const token = await user.getJWT();
 
         //Add the token to cookie and send the response back to user
          res.cookie("token",token,{expires:new Date(Date.now() + 7*24*3600000)});
          res.send(user);
      }else{
         throw new Error("Password is not Correct.")
      }
 
    }catch(err){
     res.status(400).send("ERROR : " + err.message);
    }
 })

//logout api
authRouter.post("/logout",async(req,res)=>{
    //set the token to null (remove the token from cookie),and expire at this point of time
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    })
    res.send();
})


module.exports = authRouter;