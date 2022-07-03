const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getMovie = async (req, res, next) => {
  try {
    const owner = req.user.id;
    const movie = await Movie.find({ owner });
    res.status(200).send(movie);
  } catch (err) {
    next(err);
  }
};

const createMovie = async (req, res, next) => {
  const owner = req.user.id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  try {
    Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      owner,
      movieId,
      nameRU,
      nameEN,
    }).then((movie) => {
      res.status(201).send(movie);
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при создании фильма'));
      return;
    }
    next(err);
  }
};

const deleteMovieById = async (req, res, next) => {
  const { movieId } = req.params;
  try {
    const movie = await Movie.findById({ _id: movieId });
    if (!movie) {
      next(new NotFoundError('Фильм не найден'));
      return;
    }
    if (!movie.owner.equals(req.user.id)) {
      next(new ForbiddenError('Нельзя удалять чужие фильмы'));
      return;
    }
    const movieDelById = await Movie.findByIdAndRemove(movie._id);
    res.status(200).send(movieDelById);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы некорректные данные'));
      return;
    }
    next(err);
  }
};

module.exports = {
  getMovie,
  createMovie,
  deleteMovieById,
};
