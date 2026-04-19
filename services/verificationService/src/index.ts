import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js";
import router from "./router/otp.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config(); 

const app = express();
await connectRabbitMQ();
app.use(cors());
app.use(express.json());

app.use("/api/internal/v1",router)
// app.use("/",(req,res)=>{
//     res.send("listeing");
// })
connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        //console.log(`VerificationService is running on Port - ${process.env.PORT}`);
    })
})
