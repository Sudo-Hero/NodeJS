const fs = require("fs")
const Movie = require("./../Models/Movies")
const ApiFeatures = require("./../Utils/ApiFeatures");
const CustomError = require("../Utils/CustomError");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
let welcomePage = fs.readFileSync("./public/welcome.html", "utf-8");

exports.getHighestRated = (req, res, next) => {
    console.log(req.query);
    req.query.limit = 3;
    req.query.sort = "-ratings";
    next();
}

exports.getMoviesStats = AsyncErrorHandler(async (req, res) => {
    let stats = await Movie.aggregate([
        { $match: { ratings: { $gte: 3.7 } } },
        {
            $group: {
                _id: "$releaseYear",
                avgRatings: { $avg: "$ratings" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
                totalPrice: { $sum: "$price" },
                movieCount: { $sum: 1 }
            }
        },
        { $sort: { minPrice: -1 } },
        // { $match: { maxPrice: {$gte: 14}}}
    ])

    res.status(200).json({
        status: 'success',
        length: stats.length,
        data: {
            stats
        }
    })

})

exports.getMovieByGenre = AsyncErrorHandler(async (req, res) => {
    const genre = req.params.genre;
    let movies = await Movie.aggregate([
        { $unwind: '$generes' },
        {
            $group: {
                _id: '$generes',
                movieCount: { $sum: 1 },
                movie: { $push: "$name" }
            }
        },
        { $addFields: { genre: "$_id" } },
        { $project: { _id: 0 } },
        { $sort: { movieCount: -1 } },
        { $match: { genre: genre } },
    ])
    console.log(movies);
    res.status(200).json({
        status: "success",
        movies
    })
})

exports.getMovies = AsyncErrorHandler(async (req, res) => {

    // const movies = await Movie.find({duration: req.query.duration, ratings: req.query.ratings})
    const features = new ApiFeatures(Movie.find(), req.query).filter().sort().limitFields().paginate();
    let movies = await features.query;
    // const movies = await queryResult;
    // const movies = await Movie.find()
    //                      .where('duration')
    //                      .equals(req.query.duration)
    //                      .where('ratings')
    //                      .equals(req.query.ratings);

    res.status(201).json({
        status: "success",
        length: movies.length,
        data: {
            movies
        }
    })

})

exports.createMovie = AsyncErrorHandler(async (req, res, next) => {
    const movie = await Movie.create(req.body)
    if (!movie) {
        let err = new CustomError("Unable to create movie", 400);
        return next(err);
    }
    res.status(201).json({
        movie
    })

})

exports.getMovieById = AsyncErrorHandler(async (req, res, next) => {
    const movies = await Movie.findById(req.params.id)

    if (!movies) {
        let error = new CustomError("movie not found", 404)
        return next(error);
    }

    res.status(201).json({
        status: "success",
        data: {
            movies
        }
    })

})

exports.updateMovie = AsyncErrorHandler(async (req, res, next) => {
    let movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!movie) {
        let error = new CustomError("movie not found", 404)
        return next(error);
    }

    res.status(201).json({
        status: "success",
        data: {
            movie
        }
    })

})

exports.deleteMovie = AsyncErrorHandler(async (req, res) => {
    let movie = await Movie.findByIdAndDelete(req.params.id)
    console.log("Delete: " + movie)
    if (!movie) {
        let error = new CustomError("movie not found", 404)
        return next(error);
    }

    res.status(201).json({
        status: "success",
        movie
    })
})



exports.validateReq = (req, res, next) => {
    if (!req.body.name || !req.body.year || !req.body.gener || req.body.id) {//Bad Request
        res.status(400).json({
            status: "400",
            message: "bad request"
        })
    }
    next();
}

exports.displayWelcomePage = (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.send(welcomePage);
}