const express = require('express');
const usersRoutes = require('express').Router();
const auth = require('../middlwares/auth');
const { userUpdateProfileValidation } = require('../middlwares/userValidation');
const { userLoginValidation, createUserValidation } = require('../middlwares/userValidation');

const { userProfile, userUpdateProfile } = require('../controllers/users');
const { login, createUser } = require('../controllers/users');

usersRoutes.post(
  '/signin',
  userLoginValidation,
  login,
  express.json(),
);

usersRoutes.post(
  '/signup',
  createUserValidation,
  createUser,
  express.json(),
);

usersRoutes.get('/users/me', auth, userProfile);

usersRoutes.patch(
  '/users/me',
  auth,
  userUpdateProfileValidation,
  express.json(),
  userUpdateProfile,
);

module.exports = {
  usersRoutes,
};
