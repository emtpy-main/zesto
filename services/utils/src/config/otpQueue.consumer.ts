import { getChannel } from "./rabbitmq";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { sendEmail } from "../service/email.service";

// 1. VERCEL FILE SYSTEM DEBUGGING
console.log("[INIT] process.cwd():", process.cwd());
console.log("[INIT] __dirname:", __dirname);

const templatePath = path.join(process.cwd(), 'src', 'templates', 'delivery-otp.hbs');
console.log("[INIT] Resolved template path:", templatePath);

let compiledTemplate: HandlebarsTemplateDelegate;

// 2. SAFE FILE READING (Prevents silent cold-boot crashes on Vercel)
try {
    const source = fs.readFileSync(templatePath, "utf-8");
    compiledTemplate = handlebars.compile(source);
    console.log("[INIT] ✅ Template loaded and compiled successfully.");
} catch (err: any) {
    console.error("[INIT ❌ ERROR] Failed to read or compile template file.");
    console.error("Stack trace:", err.stack);
}

export const startOTPQueueConsumer = async () => {
    try {
        console.log("[CONSUMER START] Attempting to get RabbitMQ channel...");
        const channel = await getChannel();
        console.log(`[CONSUMER START] 🔢 OTP Queue consumer active. Listening on: ${process.env.OTP_QUEUE}`);

        channel.prefetch(1);

        channel.consume(process.env.OTP_QUEUE!, async (msg) => {
            if (!msg) {
                console.warn("[CONSUMER WARN] Received empty message from queue.");
                return;
            }

            const deliveryTag = msg.fields.deliveryTag;
            console.log(`\n-----------------------------------------`);
            console.log(`[MESSAGE RECEIVED] Processing Tag: ${deliveryTag}`);

            try {
                // 3. LOG RAW PAYLOAD
                const rawContent = msg.content.toString();
                console.log(`[PAYLOAD] Raw content:`, rawContent); 

                const payload = JSON.parse(rawContent);
                const { eventId, timestamp, channel: notificationChannel, template, recipient, data } = payload;
                const { otpCode, userName, orderId } = data;
                
                console.log(`[DATA EXTRACTED] Recipient: ${recipient} | OrderID: ${orderId}`);

                let subject = "Your Zesto Delivery OTP";
                
                // 4. PRE-FLIGHT CHECK FOR TEMPLATE
                if (!compiledTemplate) {
                    throw new Error("compiledTemplate is undefined. The Handlebars file was likely not found by Vercel during build.");
                }

                console.log("[TEMPLATE] Injecting data into HTML...");
                const templateData = {
                    userName,
                    orderId: orderId?.slice(-6) || "Unknown", // Added fallback to prevent .slice() crash on missing orderId
                    otpCode,
                    timestamp 
                };
                const html = compiledTemplate(templateData);

                // 5. EMAIL TRACKING
                console.log(`[EMAIL SENDING] Calling sendEmail() for ${recipient}...`);
                await sendEmail(recipient, subject, html);
                console.log(`[EMAIL SUCCESS] ✅ Email sent to ${recipient}.`);

                console.log(`[ACK] Acknowledging message Tag: ${deliveryTag}`);
                channel.ack(msg);
                
            } catch (error: any) {
                // 6. FULL STACK TRACE LOGGING
                console.error(`[❌ PROCESS ERROR] Failed while processing message Tag: ${deliveryTag}`);
                console.error(error.stack || error); // .stack gives you the exact line number of the crash
                
                console.log(`[NACK] Dropping message Tag: ${deliveryTag}`);
                channel.nack(msg, false, false);
            }
        });
    } catch (fatalError: any) {
        console.error("[❌ FATAL ERROR] Failed to start consumer or connect to RabbitMQ.");
        console.error(fatalError.stack || fatalError);
    }
};