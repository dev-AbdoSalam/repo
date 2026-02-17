import nodemailer from "nodemailer";

export const sendEmail = async ({ to = "", cc = "", bcc = "", text = "", subject = "", html = "", attachments = [] } = {}) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false, // Use true for port 465, false for port 587
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });


    const info = await transporter.sendMail({
        from: `"Maddison Foo Koch" <${process.env.EMAIL}>`,
        to, cc, bcc, text, subject, html, attachments
    });
    return info
}