const {createTransport} = require("nodemailer");
const  Templates  = require('./emailTemplates');

const sendOTP =async(email,name,otp)=>{
    // configure nodemailer transport
    const transporter = createTransport({
        service: process.env.Email_service,
        auth: {
            user: process.env.Email_user,
            pass: process.env.Email_password
        }
    });
    // create email options
    const info=await transporter.sendMail({
        from: `"eBookingCinema"< ${process.env.Email_user} >`,
        to: email,
        subject: "Please verify your email address",
        // text: "Hello world?",
        html: Templates.otpEmailTemplate(name,otp)
    });
    console.log("Message sent: %s", info.messageId);
};
const sendTickets =async(email,name,tickets)=>{
    // configure nodemailer transport
    const transporter = createTransport({
        service: process.env.Email_service,
        auth: {
            user: process.env.Email_user,
            pass: process.env.Email_password
        }
    });
    // create email options
    const info=await transporter.sendMail({
        from: `"eBookingCinema"< ${process.env.Email_user} >`,
        to: email,
        subject: "Your tickets are ready, have fun!",
        // text: "Hello world?",
        html: Templates.ticketsEmailTemplate(tickets,name)
    });
    console.log("Message sent: %s", info.messageId);
};
const sendResetPasswordToken =async(email,name,link)=>{
    // configure nodemailer transport
    const transporter = createTransport({
        service: process.env.Email_service,
        auth: {
            user: process.env.Email_user,
            pass: process.env.Email_password
        }
    });
    // create email options
    const info=await transporter.sendMail({
        from: `"eBookingCinema"< ${process.env.Email_user} >`,
        to: email,
        subject: "Reset your password",
        // text: "Hello world?",
        html: Templates.resetPasswordTemplate(name,link)
    });
    console.log("Message sent: %s", info.messageId);
};
module.exports= {
    sendOTP,
    sendTickets,
    sendResetPasswordToken
};