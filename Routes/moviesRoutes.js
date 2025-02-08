const express = require("express")

const movieControllers = require("./../Controllers/moviesController")
const authController = require("./../Controllers/authController");

let router = express.Router()
let htmlRouter = express.Router()

router.route("/highest-rated")
      .get(authController.authorize, movieControllers.getHighestRated, movieControllers.getMovies)

router.route("/genre/:genre")
      .get(authController.authorize, movieControllers.getMovieByGenre)

router.route("/movies-stats")
      .get(authController.authorize, movieControllers.getMoviesStats)

router.route("/")
      .get(authController.authorize, movieControllers.getMovies)
      .post(movieControllers.createMovie)


router.route("/:id")
      .get(authController.authorize, movieControllers.getMovieById)
      .patch(authController.authorize, movieControllers.updateMovie)
      .delete(authController.authorize, authController.restrict, movieControllers.deleteMovie)


module.exports = router;
