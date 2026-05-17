import nodemailer from 'nodemailer';
 
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
    family: 4, 
} as any);
 
export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    try {
        const info = await transporter.sendMail({ 
            from: `"Zesto App" <${process.env.GMAIL_USER}>`, 
            to: to,
            subject: subject,
            html: htmlContent,
        });

        console.log(`✅ Gmail: Successfully sent to ${to} (ID: ${info.messageId})`);
        return info;
    } catch (error: any) {
        console.error(`❌ Gmail Failure for ${to}:`, error.message);
        throw error;  
    }
};