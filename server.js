process.on("uncaughtException", (err) => {
    console.log(err.name + ":", err.message)
    process.exit(1)
})
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config(".env")
const app = require("./app")
const port = process.env.PORT || 8080;

mongoose.connect(process.env.CONN_STR,{
    useNewUrlParser: true
}).then((conn)=>{
    console.log("DB Connection Successful");
})

let server = app.listen(port, "127.0.0.1", () => {
    console.log("Server Started")
})

process.on("unhandledRejection", (err) => {
    console.log("unhandledRejection occured!")
    server.close(() => {
        console.log("Shutting down server...")
        process.exit(1)
    })
})
