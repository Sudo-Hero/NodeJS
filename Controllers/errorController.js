const { stack } = require("../Routes/moviesRoutes");
const CustomError = require("../Utils/CustomError");

devError = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    })
}

prodError = (error, res) => {
    if (!error.Operational) {
        error.status = 'fail';
        error.message = "Something went wrong. Please try again!";
    }
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
    })
}

castErrorHandler = (error) => {
    let mesg = `Invalid value: ${error.value} for field ${error.path}`;
    return new CustomError(mesg, 400);
}

duplicateErrorHandler = (error) => {
    let key = Object.values(error.errorResponse.keyValue);
    let mesg = `Value: ${key} already exists!`;
    return new CustomError(mesg, 400);
}

validatorError = (error) => {
    let mesg = Object.values(error).map((val) => {
        return val.message;
    });
    mesg = mesg.join("!. ");
    return new CustomError(mesg, 400);
}

jsonWebTokenError = () => {
    let mesg = `Invalid Token!`;
    return new CustomError(mesg, 400);
}

tokenExpiredError = () => {
    let mesg = `Session expired. Please re-login!`;
    return new CustomError(mesg, 403);
}

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    if (process.env.NODE_ENV === "development") {
        devError(error, res);
    }
    else if (process.env.NODE_ENV === "production") {
        if (error.name === "CastError") error = castErrorHandler(error);
        else if (typeof error?.errorResponse?.code !== "undefined" && error.errorResponse.code === 11000) error = duplicateErrorHandler(error);
        else if (error?.name === "ValidationError") error = validatorError(error.errors)
        else if (error?.name === "JsonWebTokenError") error = jsonWebTokenError();
        else if (error?.name === "TokenExpiredError") error = tokenExpiredError();
        // console.log(error?.errors?.name?.name);

        prodError(error, res);
    }
}