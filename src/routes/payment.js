const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay")
const Payment = require("../models/payments");
const {membershipAmount} = require("../utils/constants")

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
        console.log(order);
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

module.exports = paymentRouter;