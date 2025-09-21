const {catchError} = require('../../../utils/errors/catchError');
const {Specialty}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const createSpecialty = catchError(async (req, res, next) => {
    const { name_en, name_ar, description_en, description_ar } = req.body;
    const existedSpecialty = await Specialty.findOne({
        where: {
            [Op.or]: [
                { name_en },
                { name_ar }
            ]
        }
    });
    if (existedSpecialty) {
        return next(new AppError('Specialty already exists', 400));
    }
    const specialty = await Specialty.create({ name_en, name_ar, description_en, description_ar });
    res.status(201).json({ message: 'created', data: specialty });
});

const getSpecialties = catchError(async (req, res, next) => {
    const apiFeatures = new ApiFeatures(Specialty, req.query).pagination().search(['name_en', 'name_ar','description_en','description_ar']);
    const specialties = await apiFeatures.execute();
    if(specialties.meta.totalResults<1){
      return next(new AppError('No specialties found',404));
    }
    res.status(200).json({ status: 'success', data: specialties });
});

const getSpecialty = catchError(async (req, res, next) => {
    const { id } = req.params;
    const specialty = await Specialty.findByPk(id);
    if (!specialty) return next(new AppError('Specialty not found', 404));
    res.status(200).json({ status: 'success', data: specialty });
});
// update only the description
const updateSpecialty = catchError(async (req, res, next) => {
    const { id } = req.params;
    const { description_en, description_ar } = req.body;

    // Check if the specialty exists
    const specialty = await Specialty.findByPk(id);
    if (!specialty) {
        return next(new AppError('Specialty not found', 404));
    }

    // Update the specialty
    await specialty.update({ description_en, description_ar });

    res.status(200).json({
        status: 'success',
        message: 'Specialty updated successfully',
        data: specialty
    });
});
const deleteSpecialty = catchError(async (req, res, next) => {
    const { id } = req.params;
    const specialty = await Specialty.findByPk(id);
    if (!specialty) return next(new AppError('Specialty not found', 404));
    if(specialty.hasDoctors()) return next(new AppError('Cannot delete specialty with assigned doctors', 400));
    await specialty.destroy();
    res.status(204).json({ status: 'success', data: null });
});
module.exports = {
    createSpecialty,
    getSpecialties,
    getSpecialty,
    updateSpecialty,
    deleteSpecialty
};