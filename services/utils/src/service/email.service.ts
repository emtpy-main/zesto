import nodemailer from 'nodemailer';
 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
 
export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    try {
        const info = await transporter.sendMail({
            // You can customize the Display Name "Zesto App" here
            from: `"Zesto App" <${process.env.GMAIL_USER}>`, 
            to: to,
            subject: subject,
            html: htmlContent,
        });

        //console.log(`✅ Gmail: Successfully sent to ${to} (ID: ${info.messageId})`);
        return info;
    } catch (error: any) {
        console.error(`❌ Gmail Failure for ${to}:`, error.message);
        throw error;  
    }
};