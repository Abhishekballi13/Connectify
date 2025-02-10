
const validator = require("validator");

const validateSignupData = (req) => {
    const {firstName,lastName,emailId,password} = req.body;

    if(!firstName || !lastName){
        throw new Error("Name is not valid");
    }
    //you can skip this validation as it is there in our model
    else if(firstName.length<4 || firstName.length>50){
        throw new Error("First name should be 4-50 characters");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email id not valid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong password");
    }
};

const validateLoginData = (req) => {
    const {emailId,password} = req.body;

    if(!emailId){
        throw new Error("Email id cannot be empty.")
    }
    else if(!password){
        throw new Error("Password cannot be empty");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email id not valid");
    }
}

module.exports = {
    validateSignupData,
    validateLoginData,
}