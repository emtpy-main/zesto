import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import uploadRoutes from "./routes/cloudinary";
import paymentRoutes from './routes/payment'
import { connectRabbitMQ } from "./config/rabbitmq";
import { startEmailConsumer } from "./config/email.consumer";
import { startOTPQueueConsumer } from "./config/otpQueue.consumer";

dotenv.config();
const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const PORT = process.env.PORT || 5002;

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
  throw new Error("Missing Cloudinary enviroment variables");
}

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});

app.use("/api",uploadRoutes);
app.use("/api/payment",paymentRoutes)

const bootstrap = async () => {
  try {
    await connectRabbitMQ();
    await startEmailConsumer();
    await startOTPQueueConsumer();
    
    app.listen(PORT, () => {
      console.log(`utils service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the application:", error);
    process.exit(1);
  }
}; 
bootstrap();