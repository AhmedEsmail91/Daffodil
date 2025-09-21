const {createTransport} = require("nodemailer");
const  Templates  = require('./../templates/DaffodilTemplates.js');

const sendApologize =async(email,name,time,AppointmentRoute,lang)=>{
    const dateObj = new Date(time);
    const date = dateObj.toLocaleDateString("en-CA", {
        timeZone: "Africa/Cairo"
    });
    const hours = dateObj.toLocaleTimeString("en-US", {
        timeZone: "Africa/Cairo",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    // configure nodemailer transport
    const transporter = createTransport({
        service: process.env.Email_service,
        auth: {
            user: process.env.Email_user,
            pass: process.env.Email_password
        }
    });
    const full_url_appointment_route = `${process.env.BASE_URL}${AppointmentRoute}`;
    const template=lang==="en"?Templates.apologizeEmailTemplate(name,date,hours,full_url_appointment_route):Templates.apologizeEmailTemplateAr(name,date,hours,full_url_appointment_route);
    const subject = lang === "en" 
        ? "We sincerely apologize for canceling your appointment." 
        : "نعتذر بصدق لإلغاء موعدك.";
    // create email options
    const info=await transporter.sendMail({
        from: `"Daffodil Clinics" < ${process.env.Email_user} >`,
        to: email,
        subject: subject,
        html: template
    });
    console.log("Message sent: %s", info.messageId);
};
const sendInitialPassword =async(email,name,password,loginLink,lang)=>{
    // configure nodemailer transport
    const transporter = createTransport({
        service: process.env.Email_service,
        auth: {
            user: process.env.Email_user,
            pass: process.env.Email_password
        }
    });
    const template=lang==="en"?Templates.initialPassword(name,email,password,loginLink):Templates.initialPasswordAr(name,email,password,loginLink);
    const subject = lang === "en" 
        ? "Your account password has been created."
        : "تم إنشاء كلمة مرور حسابك.";
    // create email options
    const info=await transporter.sendMail({
        from: `"Daffodil Clinics" < ${process.env.Email_user} >`,
        to: email,
        subject: subject,
        html: template
    });
    console.log("Message sent: %s", info.messageId);
};


module.exports= {
    sendApologize,
    sendInitialPassword
};