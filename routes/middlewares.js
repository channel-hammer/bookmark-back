const jwt = require('jsonwebtoken');
const RateLimit = require('express-rate-limit');
const AWS = require('aws-sdk');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');
const redis = require('redis');
const logger = require('../logger');

//get client from redis labs 
const redisClient = redis.createClient({
  no_ready_check: true,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  pass: process.env.REDIS_PASSWORD,
  logErrors: true,
});

// print redis errors to the console and logger
redisClient.on('error', (err) => {
  console.log('Error', + err);
  logger.log('Error', err);
});

exports.loginCache = (req, res) => {
  const {}
};

fs.readdir('uploads', (error) => {
  if(error){
    fs.mkdirSync('uploads');
  }
});
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});
exports.upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'bookmark',
    key(req, file, cb) {
      cb(null, `original/${+new Date()}${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    console.log(req.decoded);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') { // 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: 'expired token',
      });
    }
    return res.status(401).json({
      code: 401,
      message: 'invalid token',
    });
  }
};

exports.apiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10,
  delayMs: 0,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본값 429
      message: '1분에 한 번만 요청할 수 있습니다.',
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: '새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.',
  });
};

