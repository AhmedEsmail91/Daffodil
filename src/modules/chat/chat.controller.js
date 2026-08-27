const { db } = require('../../../config/firebase.js');
const { catchError } = require('../../../utils/errors/catchError');
const AppError = require('../../../utils/errors/AppError.js');
const { FieldValue } = require('firebase-admin/firestore');

const chatsRef = db.collection('chats');

const toChatDto = (doc) => ({ id: doc.id, ...doc.data() });

const byUpdatedAtDesc = (a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0);

// PATIENT: create or resume the patient's open chat
exports.startChat = catchError(async (req, res, next) => {
    const patientId = req.auth.user_id;

    const existing = await chatsRef
        .where('patient_id', '==', patientId)
        .where('status', '==', 'open')
        .limit(1)
        .get();

    if (!existing.empty) {
        return res.status(200).json({ message: 'Chat resumed', chat: toChatDto(existing.docs[0]) });
    }

    const newChat = {
        patient_id: patientId,
        patientName: req.auth.name || null,
        patientEmail: req.auth.email || null,
        status: 'open',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        closedAt: null,
    };
    const docRef = await chatsRef.add(newChat);
    const created = await docRef.get();

    res.status(201).json({ message: 'Chat started', chat: toChatDto(created) });
});

// PATIENT: list my own chats
exports.getMyChats = catchError(async (req, res, next) => {
    const patientId = req.auth.user_id;
    // Sorted in memory rather than via .orderBy() to avoid needing a Firestore
    // composite index; a single patient's chat list is always small.
    const snapshot = await chatsRef.where('patient_id', '==', patientId).get();
    const chats = snapshot.docs.map(toChatDto).sort(byUpdatedAtDesc);
    res.status(200).json({ message: 'Chats fetched successfully', chats });
});

// ADMIN: list all chats
exports.getAllChats = catchError(async (req, res, next) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    // Sorted/limited in memory rather than via .orderBy() to avoid needing a
    // Firestore composite index when a status filter is also applied.
    const query = (req.query.status === 'open' || req.query.status === 'closed')
        ? chatsRef.where('status', '==', req.query.status)
        : chatsRef;
    const snapshot = await query.get();

    if (snapshot.empty) {
        return next(new AppError('No chats found', 404));
    }
    const chats = snapshot.docs.map(toChatDto).sort(byUpdatedAtDesc).slice(0, limit);
    res.status(200).json({ message: 'All chats fetched successfully', chats });
});

// ADMIN: get one chat with its messages
exports.getChatById = catchError(async (req, res, next) => {
    const chatDoc = await chatsRef.doc(req.params.id).get();
    if (!chatDoc.exists) {
        return next(new AppError('Chat not found', 404));
    }
    const messagesSnapshot = await chatDoc.ref.collection('messages').orderBy('createdAt', 'asc').get();
    const chat = toChatDto(chatDoc);
    chat.messages = messagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ message: 'Chat fetched successfully', chat });
});

// ADMIN: close a chat
exports.closeChat = catchError(async (req, res, next) => {
    const chatRef = chatsRef.doc(req.params.id);
    const chatDoc = await chatRef.get();
    if (!chatDoc.exists) {
        return next(new AppError('Chat not found', 404));
    }
    await chatRef.update({
        status: 'closed',
        closedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });
    const updated = await chatRef.get();

    res.status(200).json({ message: 'Chat closed successfully', chat: toChatDto(updated) });
});
