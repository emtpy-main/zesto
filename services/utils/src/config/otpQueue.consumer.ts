import { getChannel } from "./rabbitmq"
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { sendEmail } from "../service/email.service";

const templatePath = path.join(process.cwd(), 'src', 'templates', 'delivery-otp.hbs');
//console.log("root" + process.cwd())
const source = fs.readFileSync(templatePath, "utf-8");
const compiledTemplate = handlebars.compile(source);

export const startOTPQueueConsumer = async()=>{
    const channel = await getChannel();
    //console.log("🔢 OTP Queue consumer active...")

    channel.prefetch(1);

    channel.consume(process.env.OTP_QUEUE!,async(msg)=>{
        if(!msg) return;
        try {
            const payload = JSON.parse(msg.content.toString());
            const {eventId,timestamp,channel:notificationChannel,template,recipient,data} = payload;
            const {otpCode,userName,orderId} = data;
            
            let subject="Your Zesto Delivery OTP";
            let html="";
            
            const templateData = {
                userName,
                orderId : orderId.slice(-6),
                otpCode,
                timestamp 
            }
            html = compiledTemplate(templateData);
            await sendEmail(recipient,subject,html);

            channel.ack(msg);
        } catch (error:any) {
            console.error("❌ OTP queue consumer processing error...",error.message);
            channel.nack(msg,false,false);
        }
    })
}