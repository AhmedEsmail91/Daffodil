const { catchError } = require("../../utils/errors/catchError.js");

module.exports=catchError(async (req,res,next)=>{
   const lang = req.headers['accept-language'] || req.headers['lang'] || 'en';
   req.lang = lang.split(',')[0];
   next();
})