const express = require('express');
const usersRoutes = require('express').Router();
const auth = require('../middlwares/auth');
const { userUpdateProfileValidation } = require('../middlwares/userValidation');

const { userProfile, userUpdateProfile } = require('../controllers/users');

usersRoutes.get('/me', auth, userProfile);

usersRoutes.patch(
  '/me',
  auth,
  userUpdateProfileValidation,
  express.json(),
  userUpdateProfile,
);

module.exports = {
  usersRoutes,
};
