const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId',userAuth, async (req,res)=>{
   const {targetUserId} = req.params;
   const {page=1,limit=15} = req.query;//default page 1 and limit 15 messages
   //authenticated logged in user.
   const userId = req.user._id;

   try{
     let chat = await Chat.findOne({
        participants: {$all:[userId,targetUserId]},
     }).populate({
        path:"messages.senderId",
        select:"firstName lastName"
     });
     if(!chat){
        chat = new Chat({
            participants: [userId,targetUserId],
            messages:[],
        })
        await chat.save();
     }

     //reverse messages to get newest first then slice for pagination,
     const totalMessages = chat.messages.length;
     const startIndex = Math.max(totalMessages-page*limit,0);
     //slicing last 15 messages out,
     const n = parseInt(startIndex) + parseInt(limit);
     const paginatedMessages = chat.messages.slice(startIndex,n);
     const hasMore = parseInt(startIndex)>0;
     
     //sending the paginated messages i.e the last 15 messages
     //length of messages is the total messages
     //hasMore that tells wether there are more messages or not
     res.json({
      messages:paginatedMessages,
      totalMessages,
      hasMore,
     })
   //   res.json(chat);
   }catch(err){
    console.log(err);
   }
})

module.exports = chatRouter;