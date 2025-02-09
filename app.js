const express = require("express")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit");
const moviesRouter = require("./Routes/moviesRoutes");
const authRouter = require("./Routes/authRouter");
const userRouter = require("./Routes/userRouter")
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean")

const movieControllers = require("./Controllers/moviesController")
const errorController = require("./Controllers/errorController")

const CustomError = require("./Utils/CustomError");

let app = express()

const logger = (req, res, next) => {
    console.log("Request received at", req.date)
    next()
}

const timeStamp = (req, res, next) => {
    req.date = new Date().toISOString();
    next()
}

let limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: "Too many requests from the user. Please wait and try again later!",
})

app.use(helmet())
app.use(express.json({limit: "10kb"}))
app.use(sanitize({replaceWith: '_'}));
app.use(xss());
app.use(express.static("./public"))
app.use(timeStamp)
if (process.env.NODE_ENV === "development")
    app.use(morgan("combined", "stream"))
app.use(logger)

app.use("/api", limiter);
app.use("/api/v1/movies", moviesRouter)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.get("/welcome", movieControllers.displayWelcomePage)
app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: "fail",
    //     message: "Page not found"
    // })
    let err = new CustomError("Page not found", 404);
    console.log("404 Page not found")
    next(err);
})
app.use((error, req, res, next) => {
    errorController(error, req, res, next);
    next();
})
module.exports = app;