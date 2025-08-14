const ar=require('./ar.js');
const en=require('./en.js');
module.exports = (key)=>{
    return {
        en: en[key] || "no custom message found",
        ar: ar[key] || "لا توجد رسالة مخصصة"
    }
};