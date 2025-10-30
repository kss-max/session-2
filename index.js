import 'dotenv/config';
import express from 'express';
import {connectDB} from './db.js';
import {event} from './models/event.js';
const app = express();
const PORT = process.env.PORT || 5001;
connectDB();
app.use(express.json());
app.get('/api/bookings', async (req, res) => {
    try{
    const events=await event.find({});
    res.status(200).json({ message: 'List of bookings', eventsDetails: events });
    }
    catch(error){
        res.status(500).json({message:"internal server error"});
    }

   
    
});


app.post('/api/bookings', async (req, res) => {
    try{
    const events=new event(req.body);
    await events.save();
    res.status(201).json({message:"new bookings created successfully", eventDetails: events})
    }
    catch(error){
        res.status(500).json({message:"internal server error"});
    }
});


app.get('/api/bookings/email/:email',async (req, res) => {
    try{
        const email=req.params.email;
        const userEvents=await event.find({email});
        
        if(!userEvents || userEvents.length===0){
            return res.status(404).json({message:"no events found for this email"});
        }
        res.status(200).json({message:"events found", eventDetails: userEvents});
    }
    catch(error){
        res.status(500).json({message:"internal server error"});
    }
});


app.get('/api/bookings/filter',async (req,res)=>{
    try{
        const filteredEvents=await event.find({event:"Synergia"});
        if(filteredEvents.length===0){
            return res.status(404).json({message:"no events found"});
        }
        res.status(200).json({message:"events found", eventDetails: filteredEvents});
    }
    catch(error){
        res.status(500).json({message:"internal server error"});
    }
});




app.get('/api/bookings/:id', async (req, res) => {
    try{
    const foundEvent=await event.findById(req.params.id);
    if(!foundEvent){
        return res.status(404).json({message:"event not found"});
    }
    res.status(200).json({message:"event found", eventDetails: foundEvent});


}
catch(error){
    res.status(500).json({message:"internal server error"});
}
});




app.put('/api/bookings/:id', async (req, res) => {
    try{
        const updatedEvent=await event.findByIdAndUpdate(req.params.id, req.body, {new:true});
        if(!updatedEvent){
            return res.status(404).json({message:"event not found"});
        }
        res.status(200).json({message:"event updated successfully", eventDetails: updatedEvent});
    }catch(error){
        res.status(500).json({message:"internal server error"});

    }
});


app.delete('/api/bookings/:id', async (req, res) => {
    try{
        const deletedEvent=await event.findByIdAndDelete(req.params.id);
        if(!deletedEvent){
            return res.status(404).json({message:"event not found"});
        }
        res.status(200).json({message:"booking deleted successfully", eventDetails: deletedEvent});
    }
    catch(error){
        res.status(500).json({message:"internal server error"});
    }
  
    
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});