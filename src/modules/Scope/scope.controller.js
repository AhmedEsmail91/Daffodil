const {Scope} = require('./../../../database/models'); // Assuming you have a Scope model
const {catchError} = require('../../../utils/errors/catchError');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
// Create a new scope
exports.createScope = catchError(async (req, res, next) => {
    const existingScope = await Scope.findOne({ where: {[Op.or]: [{name_en: req.body.name_en}, {name_ar: req.body.name_ar}] } });
    if (existingScope) {
        return next(new AppError('Scope with this name already exists', 400));
    }
    const scope = new Scope(req.body);
    const savedScope = await scope.save();
    res.status(201).json(savedScope);
});

// Get all scopes
exports.getAllScopes = catchError(async (req, res, next) => {
    const scopes = await Scope.findAll({paranoid: true});
    scopes.length < 1 ? next(new AppError('No scopes found', 404)) :
    res.status(200).json(scopes);
});

// Get a single scope by ID
exports.getScopeById = catchError(async (req, res, next) => {
    const scope = await Scope.findByPk(req.params.id, {paranoid: true});
    if (!scope) {
        return next(new AppError('Scope not found', 404));
    }
    res.status(200).json(scope);
});
// Update a scope by ID
exports.updateScope = catchError(async (req, res, next) => {
    const updatedScope = await Scope.findByPk(req.params.id, {paranoid: true});
    if (!updatedScope) {
        return next(new AppError('Scope not found', 404));
    }
    await updatedScope.update(req.body);
    res.status(200).json(updatedScope);
});
// Alternative update method using findByIdAndUpdate pattern
exports.updateScopeAlternative = catchError(async (req, res, next) => {
    const updatedScope = await Scope.findByPk(req.params.id, {paranoid: true});
    if (!updatedScope) {
        return next(new AppError('Scope not found', 404));
    }
    await updatedScope.update(req.body);
    res.status(200).json(updatedScope);
});
exports.updateScopeById = catchError(async (req, res, next) => {
    const scope = await Scope.findByPk(req.params.id, {paranoid: true});
    if (!scope) {
        return next(new AppError('Scope not found', 404));
    }
});

// Delete a scope by ID
exports.deleteScope = catchError(async (req, res, next) => {
    const deletedScope = await Scope.findByPk(req.params.id, {paranoid: true});
    if (!deletedScope) {
        return next(new AppError('Scope not found', 404));
    }
    await deletedScope.destroy();
    res.status(200).json({ message: 'Scope deleted successfully' });
});