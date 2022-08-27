require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const { usersRoutes } = require('./routes/users');
const { moviesRoutes } = require('./routes/movies');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlwares/logger');
const auth = require('./middlwares/auth');

const { NODE_ENV, DATABASE_URL } = process.env;
const { PORT = 3000 } = process.env;

const app = express();

async function main() {
  await mongoose.connect(NODE_ENV === 'production' ? DATABASE_URL : 'mongodb://localhost:27017/moviesdb', {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });

  app.listen(PORT);
}

main();

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://api.movie-karpenko.nomoreparties.sbs', 'http://api.movie-karpenko.nomoreparties.sbs, http://action.movie.nomoredomains.xyz, https://action.movie.nomoredomains.xyz'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(requestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(usersRoutes);
app.use(moviesRoutes);

app.use(auth);

app.use('/', (req, res, next) => {
  next(new NotFoundError('Страница по указанному адресу не найдена'));
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
  next();
});
