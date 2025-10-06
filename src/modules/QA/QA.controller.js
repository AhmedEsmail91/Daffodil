const {QAService}=require('../../../database/models');
const {catchError} = require('../../../utils/errors/catchError');
const QAService = require('./QA.service');

const getAllQuestions = catchError(async (req, res) => {
    const questions = await QAService.getAllQuestions();
    res.status(200).json(questions);
});

const getQuestionById = catchError(async (req, res) => {
    const { id } = req.params;
    const question = await QAService.getQuestionById(id);
    res.status(200).json(question);
});

const createQuestion = catchError(async (req, res) => {
    const questionData = req.body;
    const newQuestion = await QAService.createQuestion(questionData);
    res.status(201).json(newQuestion);
});

const updateQuestion = catchError(async (req, res) => {
    const { id } = req.params;
    const questionData = req.body;
    const updatedQuestion = await QAService.updateQuestion(id, questionData);
    res.status(200).json(updatedQuestion);
});

const deleteQuestion = catchError(async (req, res) => {
    const { id } = req.params;
    await QAService.deleteQuestion(id);
    res.status(204).send();
});

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
};