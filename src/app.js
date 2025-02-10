const express = require("express");
const connectDb = require("./config/database");
const app = express();
const {User} = require("./models/user");

//middleware
//it reads the json objeect ,converts it to javascript object add the js object back to req body.
app.use(express.json());

app.post("/signup",async (req,res)=>{
    console.log(req.body);
    
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





