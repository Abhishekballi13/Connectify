const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay")
const Payment = require("../models/payments");
const {membershipAmount} = require("../utils/constants");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");
const { User } = require("../models/user");

//creating payment order
paymentRouter.post("/payment/create",userAuth, async (req,res) => {
    try {
       
       const {membershipType} = req.body;
       const {firstName,lastName,emailId} = req.user;
    //    console.log(membershipAmount);
       const order =  await razorpayInstance.orders.create({
        //this means 50000 paise,500 rupees
            amount: membershipAmount[membershipType]*100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                membershipType,
                emailId,
            },})
        //Save it in my database
        // console.log(order);
        const payment = new Payment({
            orderId:order.id,
            userId:req.user._id,
            status:order.status,
            amount:order.amount,
            currency:order.currency,
            receipt:order.receipt,
            notes:order.notes,
        });

        const savedPayment = await payment.save();

        //Return back my order to frontend
        res.json({...savedPayment.toJSON(),keyId:process.env.RAZORPAY_KEY_ID});

    } catch (error) {
         console.log(error);
    }
})

//creating payment webhook,we dont require userAuth here
paymentRouter.post("/payment/webhook",async (req,res) => {
    try{
        console.log("webhook called");
      const webhookSignature = req.get("X-Razorpay-Signature");
      
      const isWebhookValid = validateWebhookSignature(
        JSON.stringify(req.body),
        webhookSignature,
        process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if(!isWebhookValid){
        res.status(400).json({message : "Webhook signature is invalid"});
    }

    //Update my payment status in DB
    

    const paymentDetails = req.body.payload.payment.entity; 
    const payment = await Payment.findOne({orderId : paymentDetails.order_id});
    payment.status = paymentDetails.status;
    await payment.save();   

    //Update the user as premium
    const user = await User.findOne({_id : payment.userId});
    if(!user){
        console.log("User not found");
    }
    console.log("working");
    console.log(user);
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    
    //we had two active events when we where setting up are webhooks
    // if(req.body.event == "payment.captured"){
        
    // } 
    // if(req.body.event == "payment.failed"){

    // }

     //return success response to razorpay
    //always send the response else there will be a infinite loop,it will keep checking if payment success or not
     res.status(200).json({message : "Webhook received successfully"});
    }catch(err){
        res.status(500).json({message : err.message});
    }
})

module.exports = paymentRouter;