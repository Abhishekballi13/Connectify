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
        origin: ["http://localhost:5173","https://www.connectify.icu"]
    },
})

//addding connection,or listening to connections
//whenever you will receive the connection ,these handlers will be called
io.on("connection",(socket) => {
    //Handle events
    
    //different types of handlers
    socket.on("joinChat",({userId,targetUserId})=>{
       //you create a seperate room,this room should have a seperate id
       const roomId = getSecretRoomId(userId,targetUserId);
    //    console.log("Joining room : " + roomId);
       socket.join(roomId);
    }) 

    socket.on("sendMessage",async ({firstName,lastName,userId,targetUserId,text})=>{
        //Save message to database
        const roomId = getSecretRoomId(userId,targetUserId);
        try{
            //server sending the message
         
        //   ConnectionRequestModel.findOne({
        //     fromUserId:userid,
        //     toUserId:targetUserId,
        //     status:"accepted",
        //  })

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