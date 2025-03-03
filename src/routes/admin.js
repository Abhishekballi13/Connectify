const express = require("express");
const { userAuth, adminAuth } = require("../middlewares/auth");
const { User } = require("../models/user");
const adminRouter = express.Router();

adminRouter.get("/admin/getAllUsers",adminAuth,async (req,res)=>{

    try{ 
        //excluding password
        const users = await User.find({},"-password");
        res.json(users);
    }catch(err){
        res.status(500).json({message : "Server error"});
    }
})

adminRouter.delete("/admin/user/:id",adminAuth,async(req,res)=>{
    try{
       await User.findByIdAndDelete(req.params.id);
       res.json({message:"User deleted successfully"});
    }catch(err){
        res.status(500).json({message : "Error deleting a user"});
    }
})

module.exports = adminRouter;