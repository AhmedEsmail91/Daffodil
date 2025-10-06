const { User, Role, Appointment, DoctorSchedule } = require('../../../database/models');
const {catchError} = require('../../../utils/errors/catchError');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const ApiFeatures = require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
// const QAService = require('./QA.service');


const getAllPatients = catchError(async (req, res) => {
    const dQuery=new dataQuery();
    dQuery.include=[
      {
        model: Role,
        attributes: ['name_en','name_ar'],
        as: 'role',
        where: { name_en: 'user' }
      },
      {
        model:Appointment,
        as:'appointments',
        include:[
          {
            model: DoctorSchedule,
            as: 'schedule'
          }
        ]
      }
    ]
    const patients = new ApiFeatures(User, req.query, dQuery)
      .sort()
      .search(['username','email','contact']).pagination();
    const results=await patients.execute();
    if(results.meta.totalResults<0){
        return next(new AppError('No patients found',404));
    }
    res.status(200).json(results);
});

const getPatientById = catchError(async (req, res) => {
    const { id } = req.params;
    const patient = await User.getPatientById(id);
    res.status(200).json(patient);
});

const createPatient = catchError(async (req, res) => {
    const patientData = req.body;
    const newPatient = await User.createPatient(patientData);
    res.status(201).json(newPatient);
});

const updatePatient = catchError(async (req, res) => {
    const { id } = req.params;
    const patientData = req.body;
    const updatedPatient = await User.updatePatient(id, patientData);
    res.status(200).json(updatedPatient);
});

const deletePatient = catchError(async (req, res) => {
    const { id } = req.params;
    await User.deletePatient(id);
    res.status(204).send();
});

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
};