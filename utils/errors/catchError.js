const AppError=require("./AppError.js");
exports.catchError=function(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(
            (err) => {
                next(new AppError(err, err.statusCode || 500));
            }
        );
    }
}