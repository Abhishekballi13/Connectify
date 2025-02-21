const express = require("express");
const requestRouter = express.Router();
const {userAuth} = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest")
const {User} = require("../models/user");

const sendEmail = require("../utils/sendEmail");

//send connection request
requestRouter.post("/request/send/:status/:toUserId",userAuth,async (req,res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        

        //doing all the validations
        //1.wether status is allowed or not 2.connection request is already present? 
        //3.id to which connection request is made is there in db or not.
        //4.you cannot send a connection request to yourself (done at db level).
        const allowedStatus = ["ignored","interested"];
        if(!allowedStatus.includes(status)){
            return res.
              status(400).
              json({message:`Invalid status type : `+status});
        }
        
        //trying to find existng user
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(400).json({
                message:"User not found",
            })
        }


        //if there is an existing connection request 
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                //we are checking wether fromUserId and toUserId already exist
                //if yes then there is connection request already present
              {fromUserId,toUserId,},
              //then again we check for reverse,by reversing the case
              //wether the receiver has made a connection request earlier
              //if yes then there is existing connection
              {fromUserId:toUserId,toUserId:fromUserId},
            ],
        })
        
        //dont allow connection request if it is already present
        if(existingConnectionRequest){
            return res.status(400)
            .send({message:"Connection Request Already exists!!"});
        }
        
        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });

        const data = await connectionRequest.save();

        const emailRes = await sendEmail.run(
            "A new friend request from " + req.user.firstName,
            req.user.firstName+ " is " + status + " in " + toUser.firstName
        );
        console.log(emailRes);

        // console.log("Sending a connection request");
        res.json({
            message:req.user.firstName+" is "+status+" in "+toUser.firstName,
            data,
        })
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})

//review connection request
requestRouter.post("/request/review/:status/:requestId",userAuth,async (req,res)=>{
    try{
        const loggedInUser = req.user;
        const {status,requestId} = req.params;
 
        //validate the status
        const allowedStatus = ["accepted","rejected"]; 
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message:"Status is not allowed"
            })
        }

        //We have to check wether we are logged in or not,and it is actually the same person
        //suppose i am sending request to B,(A->B), so i myself cannot approve it
        //only B can accept it.
        const connectionRequest = await ConnectionRequest.findOne({
            _id:requestId,
            toUserId:loggedInUser._id,
            status:"interested",  
        })

        if(!connectionRequest){
            res.status(404).json({
                message:"Connection request not found"
            })
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({message:"Connection request "+ status,data});

    }catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = requestRouter;