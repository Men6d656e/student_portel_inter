import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

import { getVerificationEmailTemplate } from "./email-templates/verification";
import { getCredentialsEmailTemplate } from "./email-templates/credentials";

const sendVerificationEmail = async ({ user, url }: { user: { email: string; name?: string }, url: string }) => {
    const html = getVerificationEmailTemplate({
        url,
        name: user.name || user.email.split("@")[0] // Fallback name
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Welcome to Government Graduate College Portal",
        html: html,
    })
}

const sendCredentialsEmail = async ({ email, password, name }: { email: string, password: string, name: string }) => {
    const html = getCredentialsEmailTemplate({
        email,
        password,
        name
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Account Credentials",
        html: html,
    })
}

const sendResetPasswordEmail = async ({ user, url }: { user: { email: string }, url: string }) => {
    console.log("Attempting to send reset password email to:", user.email);
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Reset your password",
            html: `
                <p>You requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="${url}">${url}</a></p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

export { sendVerificationEmail, sendResetPasswordEmail, sendCredentialsEmail };