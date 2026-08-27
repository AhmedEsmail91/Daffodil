const {catchError} = require('../../../utils/errors/catchError');
const {User,Chat,Message,DeviceToken,Role}= require('./../../../database/models/index.js');
const ApiFeatures= require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');
const { Op } = require('sequelize');
const AppError = require('../../../utils/errors/AppError.js');
const dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');
const { getMessaging, isFirebaseEnabled } = require('../../../config/firebase.js');

const STAFF_ROLES = ['admin', 'doctor'];
const isStaff = (roleName) => STAFF_ROLES.includes(roleName);

/**
 * Derive the sender identity from the authenticated JWT payload.
 * Never trust sender_type/sender_id from the request body -- that would let a
 * patient forge a message that renders as sent by staff.
 */
const deriveSender = (req) => {
    const roleName = req.auth?.role?.name;
    return {
        sender_type: isStaff(roleName) ? 'admin' : 'patient',
        sender_id: req.auth.user_id,
        sender_name: req.auth.name || 'User',
        isStaff: isStaff(roleName),
    };
};

/**
 * Figure out which device_tokens rows should be notified for a new message,
 * mirroring the old socket fan-out: patient messages went to the shared
 * "admins" room (all admin/doctor sockets); staff messages went to the
 * specific client's room (that chat's patient).
 */
const getRecipientTokens = async (chat, senderIsStaff) => {
    if (senderIsStaff) {
        if (!chat.patient_id) return [];
        return DeviceToken.findAll({ where: { user_id: chat.patient_id } });
    }
    const staffUsers = await User.findAll({
        attributes: ['id'],
        include: [{
            model: Role,
            as: 'role',
            attributes: [],
            where: { name_en: { [Op.in]: STAFF_ROLES } },
        }],
    });
    const staffIds = staffUsers.map(u => u.id);
    if (!staffIds.length) return [];
    return DeviceToken.findAll({ where: { user_id: { [Op.in]: staffIds } } });
};

/**
 * Fire-and-forget FCM push for a newly created message. Data-only payload so
 * the client decides how to render it. Cleans up stale/unregistered tokens.
 */
const notifyNewMessage = async (chat, message, senderName) => {
    try {
        if (!isFirebaseEnabled()) return;
        const messaging = getMessaging();
        if (!messaging) return;

        const tokenRows = await getRecipientTokens(chat, message.sender_type !== 'patient');
        if (!tokenRows.length) return;

        const preview = message.type === 'media'
            ? '📎 Sent an attachment'
            : String(message.content || '').slice(0, 120);

        const response = await messaging.sendEachForMulticast({
            tokens: tokenRows.map(t => t.token),
            data: {
                chatId: String(chat.id),
                messageId: String(message.id),
                senderName: String(senderName || ''),
                preview,
                type: String(message.type || 'text'),
            },
        });

        const staleIds = [];
        response.responses.forEach((r, idx) => {
            if (!r.success) {
                const code = r.error?.code;
                if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
                    staleIds.push(tokenRows[idx].id);
                }
            }
        });
        if (staleIds.length) {
            await DeviceToken.destroy({ where: { id: { [Op.in]: staleIds } } });
        }
    } catch (err) {
        console.error('FCM push error:', err.message);
    }
};

const getOrCreateChatForPatient = async (patient_id) => {
    let chat = await Chat.findOne({
        where: { patient_id, status: 'open' },
        include: [{ model: User, as: 'patient', attributes: ['id', 'username', 'email', 'contact'] }],
    });
    if (!chat) {
        chat = await Chat.create({ patient_id });
        chat = await Chat.findByPk(chat.id, {
            include: [{ model: User, as: 'patient', attributes: ['id', 'username', 'email', 'contact'] }],
        });
    }
    return chat;
};

// GET /admin/chats -- list all chats (most recent message + patient info)
exports.getAllChats = catchError(async (req, res,next) => {
    const dQuery=new dataQuery();
    dQuery.include = [{
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']]
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

// GET /admin/chats/:id -- fetch a single chat + its full message history
exports.getChatById = catchError(async (req, res,next) => {
    const chatId=req.params.id;
    const chat=await Chat.findByPk(chatId,{
        include: [{
            model: Message,
            as: 'messages',
            order: [['createdAt', 'ASC']]
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

// GET /patient/chats -- fetch (or create) the authenticated patient's chat + history
exports.getOrCreateMyChat = catchError(async (req, res, next) => {
    const patient_id = req.auth.user_id;
    const chat = await getOrCreateChatForPatient(patient_id);
    const limit = req.query?.limit ? Number(req.query.limit) : 100;
    const messages = await Message.findAll({
        where: { chat_id: chat.id },
        order: [['createdAt', 'ASC']],
        limit,
    });
    res.status(200).json({
        message: "Chat fetched successfully",
        chat: { ...chat.toJSON(), messages },
    });
});

// POST /patient/chats/messages -- patient sends a text message (chat resolved/created from the token)
exports.sendPatientMessage = catchError(async (req, res, next) => {
    const sender = deriveSender(req);
    if (sender.isStaff) {
        return next(new AppError('Only patients can use this endpoint', 403));
    }
    const chat = await getOrCreateChatForPatient(sender.sender_id);
    const message = await Message.create({
        chat_id: chat.id,
        sender_type: sender.sender_type,
        sender_id: sender.sender_id,
        content: req.body.content,
        type: 'text',
        is_pinned: false,
    });

    notifyNewMessage(chat, message, sender.sender_name).catch(() => {});

    res.status(201).json({ message: 'Message sent successfully', data: { message, chat_id: chat.id } });
});

// POST /admin/chats/:chat_id/messages -- staff sends a text message to an existing chat
exports.sendAdminMessage = catchError(async (req, res, next) => {
    const sender = deriveSender(req);
    const chat = await Chat.findByPk(req.params.chat_id);
    if (!chat) {
        return next(new AppError('Chat not found', 404));
    }
    const message = await Message.create({
        chat_id: chat.id,
        sender_type: sender.sender_type,
        sender_id: sender.sender_id,
        content: req.body.content,
        type: 'text',
        is_pinned: false,
    });

    notifyNewMessage(chat, message, sender.sender_name).catch(() => {});

    res.status(201).json({ message: 'Message sent successfully', data: { message, chat_id: chat.id } });
});

// POST /:chat_id/attachments -- send a message with file attachments (patient or admin)
exports.attachFiles = catchError(async (req, res, next) => {
    const sender = deriveSender(req);
    const { content } = req.body;

    const chat = await Chat.findByPk(req.params.chat_id);
    if (!chat) return next(new AppError('Chat not found', 404));

    if (!req.files || !req.files.attachments || req.files.attachments.length === 0) {
        return next(new AppError('No files uploaded', 400));
    }

    const images = req.files.attachments;
    const messageData = {
        chat_id: req.params.chat_id,
        sender_type: sender.sender_type,
        sender_id: sender.sender_id,
        content: content || null,
        type: 'media',
        media: images.map((image) => ({
            url: image.url,
            name: image.originalname,
            mimeType: image.mimetype,
        })),
    };

    const message = await Message.create(messageData);

    notifyNewMessage(chat, message, sender.sender_name).catch(() => {});

    const fileUrls = message.media.map((file) => file.url);

    res.status(200).json({
        message: 'Files uploaded successfully',
        data: { message, fileUrls },
    });
});

// PATCH /admin/chats/:chatId/messages/:messageId/pin -- pin/unpin a message (staff only)
exports.pinMessage = catchError(async (req, res, next) => {
    const { chatId, messageId } = req.params;
    const pinned = req.body.pinned === undefined ? true : req.body.pinned;

    const message = await Message.findOne({ where: { id: messageId, chat_id: chatId } });
    if (!message) {
        return next(new AppError('Message not found', 404));
    }

    message.is_pinned = pinned;
    message.pinned_at = pinned ? new Date() : null;
    await message.save();

    res.status(200).json({ message: 'Message pin state updated successfully', data: { message } });
});
