const catchError = (fn) => {
    return (socket, data, next) => {
        try {
            fn(socket, data);
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = catchError;