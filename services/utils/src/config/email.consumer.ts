import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { getChannel } from "./rabbitmq"; 
import { sendEmail } from "../service/email.service";
 
// const templatePath = path.join(__dirname, "../templates/welcome.hbs");
const templatePath = path.join(process.cwd(), 'src', 'templates', 'welcome.hbs');
console.log("root" + process.cwd())
const source = fs.readFileSync(templatePath, "utf-8");
const compiledTemplate = handlebars.compile(source);

export const startEmailConsumer = async () => {
  const channel = await getChannel();
  console.log("📧 Resend Email Consumer active...");

  channel.prefetch(1);

  channel.consume(process.env.EMAIL_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      const userRole = payload.data.role
        ? payload.data.role
        : "customer";

      let subject = "";
      let html = "";

      subject = `Welcome to Zesto, ${payload.data.name}!`;
      // console.log("role",userRole,userRole =="");
      const templateData = {
        name: payload.data.name,
        actionUrl: payload.data.link || "",
        isCustomer: userRole === "customer",
        isSeller: userRole === "seller",
        isRider: userRole === "rider",
        isAdmin: userRole === "admin",
      };
      html = compiledTemplate(templateData);
      console.log(payload.data);
      await sendEmail(payload.data.email, subject, html);
      channel.ack(msg);
    } catch (error: any) {
      console.error("❌ Consumer processing error:", error.message);
      channel.nack(msg, false, false);
    }
  });
};
