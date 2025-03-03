const cron = require("node-cron");
const {subDays, startOfDay, endOfDay} = require("date-fns");
const sendEmail = require("./sendEmail");
const ConnectionRequestModel = require("../models/connectionRequest");
const { Chat } = require("../models/chat");

//star represents second ,minute, hour, day of month, month, day of week
// * * * * * this will run every minute

//this job will run at 3 50 AM every day
// cron.schedule("50 03 * * *",async ()=>{
//     console.log("Hello, world!"+new Date());
//     //send email to all people who got requests  the previous day
//     const yesterday = subDays(new Date(),1);

//     const yesterdayStart = startOfDay(yesterday);
//     const yesterdayEnd = endOfDay(yesterday);

//     try{
//         //all the pending request from yesterday,i.e greater than yesterday starting time and less than yestereday ending time.

//        const pendingRequest = await ConnectionRequestModel.find({
//          status : "interested",
//          createdAt:{
//             $gte:yesterdayStart,
//             $lt:yesterdayEnd,
//          }
//        }).populate("fromUserId toUserId");
       
//        //giving the list of all emails,to whom request was send.
//        const listOfEmails = [... new Set(pendingRequest.map(req => req.toUserId.emailId))];
//        console.log(listOfEmails);
       
//        //this will work for small numbers let say you have 100 200 ids
//        //but if you have 100000 ids then it will not be efficient,it is blocking ,synchronous 
//        //so you have to implement something else like sending bulk emails throgh aws ses
//        //or making your own queues and send email inside batches.
//        //learn about bee queue and bull ,bullmq
//        for(const email of listOfEmails){
//          try {
//           const res = await sendEmail.run(
//              "New Friend Requests pending for " + email,
//              "There are so many friend request pending for you,please login to your account to see them.",
//           )
//           console.log(res);
//          } catch (error) {
//           console.log(error);
//          }
//        }
//     }catch(err){
//         console.log(err);
//         res.status(404).json({message:"Not Scheduled"});
//     }
// })

//change the time of cron job
cron.schedule("29 23 * * *", async () => {
  try {
    const desiredDay = subDays(new Date(), 1); // 1 day ago
    const desiredDayStart = startOfDay(desiredDay).getTime(); // Midnight of that day

    console.log("Attempting to delete messages before:", new Date(desiredDayStart));

    // Perform deletion
  //   $pull is a MongoDB operator used to remove elements from an array based on a condition.
  //  In this case, it removes all messages where createdAt < desiredDayStart.
  //  The messages array inside each Chat document is updated, and all old messages are deleted.
    const result = await Chat.updateMany(
      { "messages.createdAt": { $lt: desiredDayStart } },
      { $pull: { messages: { createdAt: { $lt: desiredDayStart } } } }
    );

    console.log("Deleted messages count:", result.modifiedCount);
  } catch (error) {
    console.error("Error deleting old chats:", error);
  }
});
