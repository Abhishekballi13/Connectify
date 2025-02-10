const express = require("express");
const connectDb = require("./config/database");
const app = express();
const {User} = require("./models/user");
const {validateSignupData,validateLoginData} = require("./utils/validation");
const bcrypt = require("bcrypt");

//middleware
//it reads the json object ,converts it to javascript object add the js object back to req body.
app.use(express.json());

//signup api
app.post("/signup",async (req,res)=>{   
    try{ 
        //1. validation of data , 
        validateSignupData(req);

        const {firstName,lastName,emailId,password} = req.body;

        // 2.Encrypt the password
        const passwordHash = await bcrypt.hash(password,10);
        
        //creating a new instance of this User model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password:passwordHash,
        });
    
        //data will get saved on db,it will return us a promise
        await user.save();
        res.send("User Added successfully")
    }catch(err){
        res.status(400).send("Error saving the user:"+err.message);
    }
})

//login api
app.get("/login",async (req,res)=>{
   try{
    validateLoginData(req);
     const {emailId,password} = req.body;
     //first checking wether email id is present is database or not
     //wether there is user or not
     //then we check the password entered and the one present in db
     //if both of them are matching then login Successfull
     const user = await User.findOne({emailId:emailId});
     if(!user){
        //dont expose your data by telling email id not present in db
        // throw new Error("EmailId is not present in DB");

        //just tell invaid credentials
        throw new Error("Invalid Credentials");
     }
     const isPasswordValid = await bcrypt.compare(password,user.password);

     if(isPasswordValid){
         res.send("Login SuccessFull!!!");
     }else{
        throw new Error("Password is not Correct.")
     }

   }catch(err){
    res.status(400).send("ERROR : " + err.message);
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
app.patch("/user/:userId",async(req,res) => {
    const userId = req.params?.userId;
    const data = req.body;
    // const email = req.body.email;

    try{
        const ALLOWED_UPDATES = [
            "userId","photoUrl","about","gender","age","skills"
        ]
        //every key in updated object should be there in our allowed_updates array
        //if it is not then we will not allow to update
        //if sending random things update will not be allowed
        const isUpdateAllowed = Object.keys(data).every(k => 
            ALLOWED_UPDATES.includes(k)
        );
    
        if(!isUpdateAllowed){
            throw new Error("Update is not allowed.")
        }

    //updating data by id
    //setting options in third argument in findByUpdate
    //returnDocument will give us the old data before updation
    //run validators will run validation while doing update
      const user = await User.findByIdAndUpdate({_id:userId},data,{
        returnDocument:"after",
        runValidators:true,
      });
    //updating data by email id
    // await User.findOneAndUpdate({emailId:email},data);
      res.send("User updated successfully.");
    }catch(err){
      res.status(400).send("Update failed:"+err.message);
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





