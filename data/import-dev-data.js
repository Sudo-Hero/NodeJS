const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs')
const Movie = require('../Models/Movies')

dotenv.config({path:'.env'})
mongoose.connect(process.env.CONN_STR,{
    useNewUrlParser: true
}).then((conn)=>{
    console.log("DB Connection Successful");
}).catch((error)=>{
    console.log("DB: Some error occured")
})

const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));

deleteMovie = async () =>{
    try{
        await Movie.deleteMany();
        console.log("Data Deleted Successfully!!")
    }
    catch(err){
        console.log("Error: " + err.message)
    }
    process.exit();
}

createMovie = async() => {
    try{
        await Movie.create(movies);
        console.log("Data Imported Successfully!!")
    }
    catch(err){
        console.log("Error: " + err.message)
    }
    process.exit();
}

if (process.argv[2] === '--import'){
    createMovie();
}
else if(process.argv[2] === '--delete'){
    deleteMovie();
}
else{
    console.log("Invalid Argument")
    process.exit();
}