const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequestModel = require("../models/connectionRequest");



const getSecretRoomId = (userId,targetUserId) => {
   return crypto
   .createHash("sha256")
   .update([userId,targetUserId].sort().join("_"))
   .digest("hex");
}

const initializeSocket = (server) => {
  
const io = socket(server,{
    cors: { 
        origin: ["https://www.connectify.icu","http://localhost:5173"],
        credentials : true,
    },
})

let onlineUsers  = new Map();

//addding connection,or listening to connections
//whenever you will receive the connection ,these handlers will be called
io.on("connection",(socket) => { 
    //Handle events
    
    //different types of handlers
    socket.on("joinChat",async ({userId,targetUserId})=>{
       //checking wether target user is connected to user or not
       //if not then they cannot chat.
       //using the or query to check relation user->targetUser targetUser->user
       const targetUser = await ConnectionRequestModel.findOne({
        $or:[
          
          {fromUserId : userId,
        toUserId : targetUserId,
        status : "accepted"},
        
        {fromUserId : targetUserId,
          toUserId : userId,
          status : "accepted"},
        ]
       })
       if(!targetUser){
        socket.emit("error",{errorMessage : "You are not connected to this user !!!"})
       } 
       //you create a seperate room,this room should have a seperate id
       const roomId = getSecretRoomId(userId,targetUserId);
    //    console.log("Joining room : " + roomId);
       socket.join(roomId);
    }) 

    socket.on("userOnline", ({ userId ,targetUserId}) => {
          onlineUsers.set(userId,true);
          const status = onlineUsers.has(targetUserId) ? onlineUsers.get(targetUserId) : false;
          io.emit("updateOnlineStatus", {status : status});
  });

  socket.on("userOffline", ({ userId }) => {
        onlineUsers.delete(userId);
        io.emit("updateOnlineStatus", {status : false});
});

    socket.on("sendMessage",async ({firstName,lastName,userId,targetUserId,text})=>{
        //Save message to database
        const roomId = getSecretRoomId(userId,targetUserId);
        try{

          let chat = await Chat.findOne({
            //where all the participants are in the room
            participants : {$all : [userId,targetUserId]},
          })
          if(!chat){
            chat = new Chat({
                participants : [userId,targetUserId],
                messages:[],
            })
          }

          chat.messages.push({
            senderId:userId,
            text,
          })

          await chat.save();
          io.to(roomId).emit("messageReceived",{firstName,lastName,text});
        }catch(err){
            console.log(err);
        }
    })

    socket.on("disconnect",()=>{
     
    })
})

}

module.exports = initializeSocket;