const jwt = require("jsonwebtoken");
const mongoose =  require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4,
        maxLength:50,
    },
    lastName:{
       type:String
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email address: "+value);
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a Strong Password : "+value);
            }
        }
    },
    age:{
        type:Number,
        min:18,
    },
    gender:{
        type:String,
        enum:{
            values:["male","female","other"],
            message:`{VALUE} is not a  valid gender type.`
        }
        // validate(value){
        //     if(!["male","female","others"].includes(value)){
        //         throw new Error("Gender data is not valid");
        //     }
        // },
    },
    photoUrl:{
        type:String,
        default:"https://image.pngaaa.com/853/3873853-middle.png",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid Photo URL: "+value);
            }
        }
    },
    about:{
        type:String,
        default:"This is a default about of the user."
    },
    skills:{
        type:[String],
        validate(value){
            if(value.length>10){
              throw new Error("Cannot add more than 10 skills");
            }
        }
    }
  },
  {
    timestamps:true,
  }
)

//dont use arrow function here,it will break things up
userSchema.methods.getJWT = async function(){
    //whenever you are creating instances of user model
    //when we are refering to this over here,it will represent that parrticular instance
    // this is why arrow fn will not work
   const user = this;
   const token = await jwt.sign({_id:user._id},"DEV@Connectify$790",{
     expiresIn:"7d",
   });
   return token;
}

userSchema.methods.checkPassword = async function(passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    //you cannot interchange both of them,passwordInputByUser,passwordHash inside compare
    const isPasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash);
    return isPasswordValid;
}

const User = mongoose.model("User",userSchema);

module.exports = {
  User
}