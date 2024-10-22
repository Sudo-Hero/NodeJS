const express = require("express")
const morgan = require("morgan")

let moviesRouter = require("./Routes/moviesRoutes");
let app = express()

const logger = (req,res,next) =>{
    console.log("Request received at", req.date)
    next()
}

const timeStamp = (req, res, next) => {
    req.date = new Date().toISOString();
    next()
}

app.use(express.json())
app.use(timeStamp)
app.use(morgan("combined", "stream"))
app.use(logger)

app.use("/api/v1/movies", moviesRouter)

module.exports = app;