const mongoose =  require("mongoose");
const validator = require("validator");

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
    },
    age:{
        type:Number,
        min:18,
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender data is not valid");
            }
        },
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

const User = mongoose.model("User",userSchema);

module.exports = {
  User
}