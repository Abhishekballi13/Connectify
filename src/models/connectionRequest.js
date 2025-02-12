const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", //refrence to the user collection
        required:true,
    },
    toUserId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    status: {
        type:String,
        required:true,
        enum : {
            values:["ignored","interested","accepted","rejected"],
            message:`{VALUE} is incorrect status type`
        }
    }
},{
    timestamps:true,
}
);

//dont use arrow functions inside pre function
//every time we will call save this pre function will get triggered
//before you save ,pre will be called
//will check if the user is sending connection request to himself
connectionRequestSchema.pre("save",function(next){
  const connectionRequest = this;
  //CHECK if the fromUserId is same as toUserId
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("You cannot send connection request to yourself");
  }
  next();
})

//ConnectionRequest.find({fromUserId:67aa70db6f61f38eaf52d130,toUserId:67aa70db6f61f38eaf52d131})
//creating compund index,when we have multiple fields
connectionRequestSchema.index({fromUserId:1,toUserId:1});

const ConnectionRequestModel = new mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports = ConnectionRequestModel;