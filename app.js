const express = require("express")
const morgan = require("morgan")

const moviesRouter = require("./Routes/moviesRoutes");
const authRouter = require("./Routes/authRouter");
const userRouter = require("./Routes/userRouter")

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

app.use(express.json())
app.use(express.static("./public"))
app.use(timeStamp)
if (process.env.NODE_ENV === "development")
    app.use(morgan("combined", "stream"))
app.use(logger)

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