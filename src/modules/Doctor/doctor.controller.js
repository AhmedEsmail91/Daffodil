const {catchError} = require('../../../utils/errors/catchError');
const {User,Doctor, DoctorSchedule,Appointment,Specialty}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const changeUserToDoctor=catchError(async (req, res, next) => {
    const {doctor_id} = req.params;
    
    const {
        name_en, // dr.ahmed
        name_ar, // د/احمد
        specialty_id,
        licenseNumber,
        phoneNumber,
        bio_en,
        bio_ar,
        approved = false
    } = req.body;

    let doctor = await Doctor.findByPk(doctor_id, {
        where: {
            approved: false
        },
        include: [{
            model: User,
            as: 'user'
        }, {
            model: Specialty,
            as: 'specialty'
        }]
    });

    if(!doctor){
        return next(new AppError('Doctor not found', 404));
    }
    // check the specialty
    const specialty = await Specialty.findByPk(specialty_id);
    if (!specialty) {
        return next(new AppError('Specialty not found', 404));
    }
    const doctorData={
        name_en,
        name_ar,
        licenseNumber,
        phoneNumber,
        bio_en,
        bio_ar,
        approved
    }
    doctor.setSpecialty(specialty_id);
    doctor = await doctor.update(doctorData);

    // Optionally, you can send an email to the user notifying them of their new role as a doctor.
    // if(approved){
    //     await sendEmail({
    //         to: doctor.user.email,
    //         subject: 'You are now a Doctor',
    //         text: `Congratulations ${doctor.name_en}, you have been approved as a doctor on our platform.`
    //     });
    // }
    res.status(201).json({ status: 'success', data: { doctor } });
})
const getAllDoctors = catchError(async (req, res, next) => {
    let schedules_state= req.query.schedules_state=='active'?true : false;
    const approved= req.query.approved||true;
    if(approved==false) schedules_state = null;
    const dQuery=new dataQuery()
    dQuery.where={approved}
    dQuery.include=[
        {model:User,as:'user'},
        {model:Specialty,as:'specialty'},
        {
            model: DoctorSchedule,
            as: 'schedules',
            ...(schedules_state?{where:{
                from: {
                    [Op.lte]: new Date()
                }
            },required:false}:{}),
            
            include: [{
                model: Appointment,
                as: 'appointments'
            }]
        },
    ]
    const doctors_paginated = new ApiFeatures(Doctor, req.query,dQuery).pagination().search(['name_en'])
    const results = await doctors_paginated.execute();
    (results.meta.totalResults>0) ? res.status(200).json({ status: 'success', data: { doctors: results } }) : next(new AppError('No doctors found', 404));
});
const getDoctorsShort=catchError(async (req,res,next)=>{
    const approved= req.query.approved||true;
    const doctors=await Doctor.findAll({
        where:{approved},
        attributes:['id','name_en','name_ar'],
        include:[
            {model:User,as:'user',attributes:['id','email']},
            {model:Specialty,as:'specialty',attributes:['id','name_en','name_ar']}
        ]
    });
    if(doctors.length==0){
        return next(new AppError('No doctors found', 404));
    }
    res.status(200).json({status:'success',data:{doctors}});
})
const updateDoctor=catchError(async (req,res,next)=>{
    const doctor_id = req.params.id;
    const {
        name_en, // dr.ahmed
        name_ar, // د/احمد
        specialty_id,
        licenseNumber,
        phoneNumber,
        bio_en,
        bio_ar,
        approved
    } = req.body;
    let doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }
    // Check the specialty if provided
    if (specialty_id) {
        const specialty = await Specialty.findByPk(specialty_id);
        if (!specialty) {
            return next(new AppError('Specialty not found', 404));
        }
    }
    // Update only the fields that are provided in the request body
    const updatedFields = Object.fromEntries(
        Object.entries({
            name_en,
            name_ar,
            specialty_id,
            licenseNumber,
            phoneNumber,
            bio_en,
            bio_ar,
            approved
        }).filter(([_, value]) => value !== undefined)
    );

    doctor = await doctor.update(updatedFields);
    res.status(200).json({ status: 'success', data: { doctor } });
})
module.exports = { changeUserToDoctor, getAllDoctors,getDoctorsShort, updateDoctor }