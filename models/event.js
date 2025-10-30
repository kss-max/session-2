import mongoose from "mongoose";
const eventSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    event:{
        type:String,
        required:true
    },
    ticketType:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

});

export const event = mongoose.model("event", eventSchema);

