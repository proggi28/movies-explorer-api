const express = require('express');
const moviesRoutes = require('express').Router();
const auth = require('../middlwares/auth');
const { movieCreateValidation, movieDeleteValidation } = require('../middlwares/movieValidation');

const { getMovie, createMovie, deleteMovieById } = require('../controllers/movies');

moviesRoutes.get('/', auth, getMovie);

moviesRoutes.post(
  '/',
  auth,
  movieCreateValidation,
  express.json(),
  createMovie,
);

moviesRoutes.delete(
  '/:movieId',
  auth,
  movieDeleteValidation,
  deleteMovieById,
);

module.exports = {
  moviesRoutes,
};
