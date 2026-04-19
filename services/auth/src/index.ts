import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import authRoute from './routes/auth.js'
import cors from "cors";
import {connectRabbitMQ } from './config/rabbitmq.js';

dotenv.config();

const app = express();
connectRabbitMQ();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth",authRoute);

app.listen(PORT,()=>{
    connectDB();
    //console.log(`Auth service is running on port ${PORT}`);
})