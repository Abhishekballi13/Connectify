const express = require("express");

const app = express();

app.use("/hello",(req,res)=>{
    res.send("Hello Hello");
})


//creating server that listens on port 3000
app.listen(3000,()=>{
    console.log("Server is listening on port 3000");
});