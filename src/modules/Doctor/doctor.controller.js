const {catchError} = require('../../../utils/errors/catchError');
const {User,Doctor, DoctorSchedule,Appointment,Specialty}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const changeUserToDoctor=catchError(async (req, res, next) => {
    const {
        email,
        name_en, // dr.ahmed
        name_ar, // د/احمد
        specialty_id,
        licenseNumber,
        phoneNumber,
        bio_en,
        bio_ar
    } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    let doctor = await Doctor.findOne({ where: { user_id: user.id } });
    // check the specialty
    const specialty = await Specialty.findByPk(specialty_id);
    if (!specialty) {
        return next(new AppError('Specialty not found', 404));
    }
    if (doctor) {
        // Update the existing doctor
        doctor = await doctor.update({
            name_en,
            name_ar,
            specialty_id,
            licenseNumber,
            phoneNumber,
            bio_en,
            bio_ar
        });
    } else {
        // Create a new doctor if not found
        doctor = await Doctor.create({
            user_id: user.id,
            name_en,
            name_ar,
            specialty_id,
            licenseNumber,
            phoneNumber,
            bio_en,
            bio_ar
        });
    }
    res.status(201).json({ status: 'success', data: { doctor } });
})
const resetDoctorPassword=catchError(async(req,res,next)=>{
   const { email, newPassword } = req.body;

   // Find the doctor by email
   const doctor = await Doctor.findOne({ where: { email } });
   if (!doctor) {
       return next(new AppError('Doctor not found', 404));
   }

   // Update the doctor's password
   doctor.password = newPassword;
   await doctor.save();

   res.status(200).json({ status: 'success', message: 'Password reset successfully' });
})
const getAllDoctors = catchError(async (req, res, next) => {
    const approved= req.query.approved||true;
    const dQuery=new dataQuery()
    dQuery.where={approved}
    dQuery.include=[
        {model:User,as:'user'},
        {model:Specialty,as:'specialty'},
        {model:DoctorSchedule,as:'schedules',include:[{model:Appointment,as:'appointments'}]},
    ]
    const doctors_paginated = new ApiFeatures(Doctor, req.query,dQuery).pagination().search(['name_en'])
    const results = await doctors_paginated.execute();
    (results.meta.totalResults>0) ? res.status(200).json({ status: 'success', data: { doctors: results } }) : next(new AppError('No doctors found', 404));
});
module.exports = { changeUserToDoctor, getAllDoctors,resetDoctorPassword }