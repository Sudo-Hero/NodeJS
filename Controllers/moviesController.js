const fs = require("fs")

let movies = JSON.parse(fs.readFileSync("./movie.json", "utf-8"))
exports.getMovies = (req, res) => {
    res.json({
        status: "success",
        date: req.date,
        count: movies.length,
        data: movies
    })
}

exports.createMovie = (req, res) => {
    console.log(req.body)
    let newId = movies[movies.length - 1].id + 1;
    let movie = Object.assign({ "id": newId }, req.body);
    // console.log(movie)
    movies.push(movie)
    movies = JSON.stringify(movies)
    fs.writeFile("./movies.json", movies, (err) => {
        if (err) {
            res.status(500).json({
                status: "error",
                error: err
            })
        }
        res.status(200).json({
            status: "sucess",
            message: "Created",
            data: movie
        })
    })
}

exports.getMovieById = (req, res) => {
    let movie = movies.find((list) => {
        return list.id === req.params.id * 1
    })
    // if (!movie) {
    //     res.status(200).json({
    //         status: "failure.",
    //         message: "movie not found.",
    //         data: movie
    //     })
    // }   
    res.status(200).json({
        status: "success",
        data: movie
    })
}

exports.updateMovie = (req, res) => {
    movieId = req.params.id
    let movieToUpdate = movies.find((data) => {
        return data.id === movieId * 1
    })
    // if (!movieToUpdate) {
    //     res.status(404).json({
    //         status: "error",
    //         message: "bad request"
    //     })
    // }
    Object.assign(movieToUpdate, req.body);
    movieIndex = movies.indexOf(movieToUpdate.id)
    movies[movieIndex] = movieToUpdate

    fs.writeFile("./movie.json", JSON.stringify(movies), (err) => {
        if (err) {
            res.status(500).json({
                status: "failure",
                message: err.cause || "an error occured"
            })
        }
        console.log(movieToUpdate)
        res.status(200).json({
            status: "success",
            data: movieToUpdate
        })
    })

}

exports.deleteMovie = (req, res) => {
    let movieId = req.params.id * 1;
    let movieToDelete = movies.find((data) => {
        return data.id === movieId * 1
    })
    // if (!movieToDelete) {
    //     res.status(404).json({
    //         status: "error",
    //         data: null,
    //         message: "id not found."
    //     })

    // }
    movieIndex = movies.indexOf(movieToDelete)
    let deletedMovie = movies.splice(movieIndex, 1)
    console.log(deletedMovie)
    fs.writeFile("./movie.json", JSON.stringify(movies), (err) => {
        if (err) {
            res.status(500).json({
                status: "failure",
                data: null,
                message: "internal server error."
            })
        }
        res.status(202).json({
            status: "success",
            data: deletedMovie,
            message: "data deleted sucessfully."
        })
    })

}

exports.checkId = (req, res, next, id) => {
    let movieToCheck = movies.find((movie) => {
        return movie.id === id * 1;
    })
    if (!movieToCheck) {
        return res.status(404).json({
            status: "error",
            message: "cannod find movie with id " + id,
        })
    }
    console.log("Param: ", id, "movieToCheck: ", movieToCheck)
    next();
}

exports.validateReq = (req,res,next) => {
    if(!req.body.name || !req.body.year || !req.body.gener || req.body.id){//Bad Request
        res.status(400).json({
            status: "400",
            message: "bad request" 
        })
    }
    next();
}