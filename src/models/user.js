const mongoose =  require("mongoose");

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