const {catchError} = require('../../../utils/errors/catchError');
const {User,Chat,Message}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
exports.getAllChats = catchError(async (req, res,next) => {
    const dQuery=new dataQuery();
    dQuery.include = [{
            model: Message,
            as: 'messages'
        },
        {
            model: User,
            as: 'patient'
        }
    ];
    const apiFeatures=new ApiFeatures(Chat,req?.query,dQuery)
    .pagination()
    .sort()
    // .search('messages.content');
    const chats=await apiFeatures.execute();
    if(chats.meta.totalResults===0){
        return next(new AppError('No chats found', 404));
    }

    res.status(200).json({ message: "All chats fetched successfully", chats });
});
exports.getChatById = catchError(async (req, res,next) => {
    const chatId=req.params.id;
    const chat=await Chat.findByPk(chatId,{
        include: [{
            model: Message,
            as: 'messages'
        },
        {
            model: User,
            as: 'patient'
        }]
    });
    if(!chat){
        return next(new AppError('Chat not found', 404));
    }
    res.status(200).json({ message: "Chat fetched successfully", chat });
});