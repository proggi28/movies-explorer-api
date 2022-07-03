const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const SALT_ROUNDS = 10;

const userProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

const userUpdateProfile = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      { email, name },
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).send(updateUser);
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует!'));
      return;
    }
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      return;
    }
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы некорректные данные'));
      return;
    }
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email,
      password: hash,
      name,
    });
    const savedUser = await user.save();
    const { password: removedPassword, ...result } = savedUser.toObject();
    res.status(201).send(result);
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError('Данный email уже зарегистрирован'));
      return;
    }
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      return;
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError('Неправильные логин или пароль'));
    return;
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    next(new UnauthorizedError('Неправильные логин или пароль'));
    return;
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    next(new UnauthorizedError('Неправильные логин или пароль'));
    return;
  }

  const token = await jwt.sign(
    { id: user.id },
    NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    { expiresIn: '7d' },
  );
  res.status(200).send({ token });
};

module.exports = {
  userProfile,
  userUpdateProfile,
  createUser,
  login,
};
