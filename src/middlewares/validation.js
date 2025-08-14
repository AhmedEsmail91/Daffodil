const AppError= require('../../utils/errors/AppError.js');
const valLang=require('../../utils/lang/validation-messages');
// Signup validation function
const validation=(schema)=>{
    return async (req, res, next)=>{
    //generalize the input of the validation function to be the request body or the request params.
    let filter={};
    
    if(req.file){
        filter={...req.file,...req.body,...req.params,...req.query};
        //console.log({file:true,fields:filter})
    }
    else if(req.files){
        filter={...req.files,...req.body,...req.params,...req.query};
    }
    else{
        filter={...req.body,...req.params,...req.query};
        //console.log({file:true,fields:filter})
    }
    
    const {error} = await schema.validate(filter, { abortEarly: false });

    if (error) {
        // console.log(error.details);
        let errMsg=[];
        error.details.forEach(element => {
            const lang = req?.lang || 'en';
            const { en, ar, val } = valLang(element.message);
            const message = val ? (lang === 'ar' ? ar : en) : element.message;
            errMsg.push(message); 
        });
        // console.log(errMsg.length)
        next(new AppError(errMsg, 400));
    } else {
        next();
    }
}  
};

module.exports= validation; 