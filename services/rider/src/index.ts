import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"
import cors from 'cors'
import riderRoutes from './routes/rider.js'
import { connectRabbitMQ } from "./config/connectRabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderReady.consumer.js";


dotenv.config();
await connectRabbitMQ();
startOrderReadyConsumer();
const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',  
    process.env.FRONTEND_URL as string
  ],
  credentials: true  
}));
app.use(express.json())


app.use('/api/rider',riderRoutes);


connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Rider service is running on port ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("Error while connecting to db 📊");
  });
