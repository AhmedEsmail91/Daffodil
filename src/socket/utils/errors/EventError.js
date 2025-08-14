const env=process.env.NODE_ENV || 'development';
const errorEvent = (socket, type, message, err = {}, statusCode=500) => {
    socket.emit('error_event', {
        statusCode,
        type,
        message,
        ...(env === 'development' && err.details ? { details: err.details } : {}),
        ...(env === 'development' ? { stack: err.stack || 'No stack trace available' } : {})
    });
};


module.exports = errorEvent;