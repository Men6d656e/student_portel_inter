import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

const sendVerificationEmail =async ({user,url}:{user:{email:string},url:string})=>{
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to:user.email,
        subject: "Verify your email",
        html: `<p>Please verify your email by clicking on the following link: <a href="${url}">${url}</a></p>`,
    })
}
export {sendVerificationEmail};