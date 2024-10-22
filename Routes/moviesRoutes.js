const express = require("express")

const movieControllers = require("./../Controllers/moviesController")

let router = express.Router()

router.param('id', movieControllers.checkId)

router.route("/")
    .get(movieControllers.getMovies)
    .post(movieControllers.validateReq,movieControllers.createMovie)

router.route("/:id")
    .get(movieControllers.getMovieById)
    .patch(movieControllers.updateMovie)
    .delete(movieControllers.deleteMovie)

module.exports = router;
