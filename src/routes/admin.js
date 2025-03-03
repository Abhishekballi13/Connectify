const express = require("express");
const { userAuth, adminAuth } = require("../middlewares/auth");
const { User } = require("../models/user");
const adminRouter = express.Router();

adminRouter.get("/admin/getAllUsers", adminAuth, async (req, res) => {
    try { 
        const user = req.user;
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
        const skip = (page - 1) * limit;

        // Fetch users with pagination, excluding the password field
        const users = await User.find({_id: { $ne: user._id }}, "-password")
                                .skip(skip)
                                .limit(limit);

        // Get total user count (excluding the admin)
        const totalUsers = await User.countDocuments({_id: { $ne: user._id }});

        res.json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


adminRouter.delete("/admin/user/:id",adminAuth,async(req,res)=>{
    try{
       await User.findByIdAndDelete(req.params.id);
       res.json({message:"User deleted successfully"});
    }catch(err){
        res.status(500).json({message : "Error deleting a user"});
    }
})

module.exports = adminRouter;