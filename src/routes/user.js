const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const { User } = require("../models/user");
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills"

//showing received requests
userRouter.get("/user/requests/received",userAuth,async (req,res)=>{
    try{
       
        const loggedInUser = req.user;
        
        //finding all the request of logged in user
        const userRequests = await connectionRequest.find(
            {
                toUserId:loggedInUser._id,
                status:"interested"
            }
        ).populate("fromUserId",["firstName","lastName","photoUrl","age","gender","about","skills"]); //if you dont pass the second parameter it will return the entire object.We dont want overfecthing data
        // .populate("fromUserId firstName lastName photoUrl age gender about skills"]); //both ways are same either use string or array

        res.json({message:"Data send successfully",userRequests});
    }catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
})

//getting connections
userRouter.get("/user/connections",userAuth,async (req,res)=>{
    try{
      const loggedInUser = req.user;
      
      const connections = await connectionRequest.find(
        {   
            //some user made a request and we accepted first case
            //using or query because if we have made the request and it is accepted this is second case
            //so in both cases toUserId and fromUserId should always be loggedInUser to display all connections.
            //A can be sender and receiver both
            $or:[
                {toUserId:loggedInUser._id,status:"accepted"},
                {fromUserId:loggedInUser._id,status:"accepted"}
            ],
        }).populate("fromUserId",USER_SAFE_DATA)
          .populate("toUserId",USER_SAFE_DATA);

        //we only want to display user data and not connectionRequest table data
        const data = connections.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({data:data});

    }catch(err){
        res.status(400).send({message:err.message});
    }
})

//feed section
userRouter.get("/feed",userAuth,async (req,res)=>{
    try{
     
        //user should see all the user cards except
        //0. his own card
        //1. his connections
        //2.ignored people
        //3.already sent the connection request
        //if entry has already been created for connection req then dont see it

        const loggedInUser = req.user;
        
        //pagination
        //parsing the page number to int as they will be in string,and if page is not there then assume it to be 1
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1)*limit;

        //finding all the connection request,that either i have send or received
        const userConnectionRequests = await connectionRequest.find({
            $or:[{fromUserId:loggedInUser._id},{toUserId:loggedInUser._id}],
        }).select("fromUserId toUserId");//select will filter only fromUserId and toUserId

        const hideUsersFromFeed = new Set();
        userConnectionRequests.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        })
        // console.log(hideUsersFromFeed);
 
        const users = await User.find({
            //all the people in database except the hiddenUsersFromFeed,that is whom we already have connection with
            //$nin ,not in ,$ne not equal to (dont show his own)
            //$and ,both conditions are true.
            $and : [
                {_id: {$nin:Array.from(hideUsersFromFeed)}},
                {_id : {$ne:loggedInUser._id}}
            ],
            _id : {$nin: Array.from(hideUsersFromFeed)}
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.send(users);
    }catch(err){
        res.status(400).json({ message: err.message});
    }
})

module.exports = userRouter;