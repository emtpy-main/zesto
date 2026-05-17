import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { getChannel } from "./rabbitmq";
import { sendEmail } from "../service/email.service";
 
const templatePath1 = path.join(process.cwd(), "src", "templates", "welcome.hbs");
const templatePath2 = path.join(process.cwd(), "src", "templates", "verify-user.hbs");
// const templatePath1 = path.join(__dirname, '../templates/welcome.hbs');
// const templatePath2 = path.join(__dirname, '../templates/verify-user.hbs');
console.log("root: " + process.cwd());

const source1 = fs.readFileSync(templatePath1, "utf-8");
const compiledTemplate1 = handlebars.compile(source1);

const source2 = fs.readFileSync(templatePath2, "utf-8");
const compiledTemplate2 = handlebars.compile(source2);

export const startEmailConsumer = async () => {
  const channel = await getChannel();
  console.log("📧  Email Consumer active...");

  channel.prefetch(1);

  channel.consume(process.env.EMAIL_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      const userRole = payload.data.role ? payload.data.role : "customer";
      
      const { adminEmails, createdAt, name, email } = payload.data;
       console.log(`email consumer: `,adminEmails,email,name,createdAt,userRole);
      // ----------------------------------------------------
      // 1. Send "Welcome" Email to the newly registered User
      // ----------------------------------------------------
      const welcomeSubject = `Welcome to Zesto, ${name}!`;
      const welcomeTemplateData = {
        name,
        actionUrl: payload.data.link || "",
        isCustomer: userRole === "customer",
        isSeller: userRole === "seller",
        isRider: userRole === "rider",
        isAdmin: userRole === "admin",
      };
      
      const welcomeHtml = compiledTemplate1(welcomeTemplateData);
      await sendEmail(email, welcomeSubject, welcomeHtml);

      // ----------------------------------------------------
      // 2. Send "Verification Alert" Email to the Admin
      // ----------------------------------------------------
      // FIX: Removed the '!' from adminEmail
      if ((userRole === "rider" || userRole === "seller") && adminEmails.length !== 0) {
        
        const adminSubject = `Action Required: Verify newly registered ${userRole} - ${name}`;
        
        // Safely parse the date
        const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : new Date().toLocaleDateString();

        const adminTemplateData = {
          name,
          email,
          role: userRole,
          createdAt: formattedDate,
          adminDashboardUrl: `${process.env.MYDOMAIN}/admin/users/pending`, // FIX: Matched variable name to the .hbs file
        };
        
        const adminHtml = compiledTemplate2(adminTemplateData);
        adminEmails.forEach(async (adminEmail:string)=>{
           await sendEmail(adminEmail, adminSubject, adminHtml);
            console.log(`email consumer: `,adminEmail,email,name,createdAt,userRole);
        })
       
      }
   
      // Acknowledge the message only after BOTH emails have succeeded
      channel.ack(msg);

    } catch (error: any) {
      console.error("❌ Consumer processing error:", error.message);
      // Nack the message without requeueing (sends to Dead Letter Queue if configured)
      channel.nack(msg, false, false);
    }
  });
};