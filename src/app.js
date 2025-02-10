const express = require("express");
const connectDb = require("./config/database");
const app = express();
const {User} = require("./models/user");

//middleware
//it reads the json objeect ,converts it to javascript object add the js object back to req body.
app.use(express.json());

app.post("/signup",async (req,res)=>{    
    //creating a new instance of this User model
    const user = new User(req.body);
    
    //data will get saved on db,it will return us a promise
    try{
        await user.save();
        res.send("User Added successfully")
    }catch(err){
        res.status(400).send("Error saving the user:"+err.message);
    }
})

//Get user by email
app.get("/user",async (req,res)=>{
    const userEmail = req.body.emailId;
    try{
        const users = await User.find({emailId:userEmail});
        if(users.length===0){
            res.status(404).send("USer Not Found!!");
        }
        else res.send(users);
    }catch(err){
        res.status(400).send("Somrthing went wrong!!")
    }
})

//FEED API - GET  /feed - get all the users from the database
app.get("/feed",async (req,res)=>{
    
    try{
        const users = await User.find({});
        res.send(users);
    }catch(err){
        res.status(401).send("Something went wrong!!");
    }
})

//deleting user by id
app.delete("/user",async (req,res) => {
    const userId = await req.body.userId;
    // const data = req.body;
    try{
        const user = await User.findByIdAndDelete({_id:userId });
        // const user = await User.findByIdAndDelete(userId);
        res.send( "User Deleted Successfully");
    }catch(err){
        res.status(400).send("Something wrong happened.")
    }
});

//update data of the user
app.patch("/user",async(req,res) => {
    const userId = req.body.userId;
    const data = req.body;
    try{
      await User.findByIdAndUpdate({_id:userId},data);
      res.send("User updated successfully.");
    }catch(err){
      res.status(400).send("Something wrong happened.")
    }
})

connectDb().then(()=>{
    console.log("Database Connected....");
    //listening when our databse in connected successfully 
    //so that whenever user hits any api or service that involves some db ,there is no problem
    app.listen("7777",()=>{
        console.log("listening on port 7777");
    })
})
.catch((err) => {
    console.log("Database cannot be established.")
})





