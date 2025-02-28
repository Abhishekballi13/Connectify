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

const onlineUsers  = new Map();

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

    socket.on("userOnline", ({ userId }) => {
      if (userId) {
          onlineUsers.set(userId, socket.id);
          io.emit("updateOnlineStatus", { userId, isOnline: true });
      }
  });

  socket.on("userOffline", ({ userId }) => {
    if (userId) {
        onlineUsers.delete(userId);
        io.emit("updateOnlineStatus", { userId, isOnline: false });
    }
});

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
      // let disconnectedUserId = null;

      // // Find the userId associated with this socket
      // for (const [userId, socketId] of onlineUsers.entries()) {
      //     if (socketId === socket.id) {
      //         disconnectedUserId = userId;
      //         break;
      //     }
      // }

      // if (disconnectedUserId) {
      //     onlineUsers.delete(disconnectedUserId);
      //     io.emit("updateOnlineStatus", { userId: disconnectedUserId, isOnline: false });
      // }

      // console.log("A user disconnected:", socket.id);
    })
})

}

module.exports = initializeSocket;