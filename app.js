const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const helmet = require('helmet');
const hpp = require('hpp');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const fs = require('fs');

dotenv.config();
const logger = require('./logger');
const v1 = require('./routes/v1');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
passportConfig();
app.set('port', process.env.PORT || 8002);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true, 
});
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
if (process.env.NODE_ENV === 'production'){
  app.use(morgan('combined'));
  app.use(helmet());
  app.use(hpp());
} else{
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));


const client = redis.createClient({
  no_ready_check: true,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  pass: process.env.REDIS_PASSWORD,
  logErrors: true,
});

const sessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({
    client
  }),
}
if (process.env.NODE_ENV === 'production'){
  sessionOptions.proxy = true;
  sessionOptions.cookie.secure = true;
}
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.use('/v1', v1);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.error(error.message);
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  logger.info(app.get('port'), '번 포트에서 대기중');
});