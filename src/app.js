const express = require("express");

const app = express();

const {adminAuth, userAuth} = require("./middlewares/auth");

//app.use("/route",rH,[rH2,rH3],rH4,rH5);
// GET /user => midddleware chain => request handler

//Handle Auth middleware for all GET POST,... requests.
app.use("/admin",adminAuth);

app.get("/user",userAuth,(req,res)=>{
    res.send("User data send");
})

 app.get("/admin/getAllData",(req,res)=>{
    res.send("All Data send");
 })

 app.get("/admin/deleteUser",(req,res)=>{
    res.send("Deleted a user");
 })

//creating server that listens on port 3000
app.listen(3000,()=>{
    console.log("Server is listening on port 3000");
});