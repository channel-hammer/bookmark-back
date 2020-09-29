const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');
const fs = require('fs');
const { QueryTypes, Sequelize } = require('sequelize');
const redis = require('redis');
const logger = require('../logger');

const { verifyToken, apiLimiter, upload } = require('./middlewares');
const { User, Book, Category, Feed, sequelize } = require('../models');

const router = express.Router();

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


router.post('/account/profile', verifyToken, upload.single('img'), async (req, res) => {
  const { user_id } = req.body;
  try {
    await User.update(
      { profileUri: req.file.location, },
      { where: { id: user_id }
    }); 

    console.log(req.file.location);
    return res.status(201).json({
      code: 201,
      payload: req.file.location,
      message: 'successful upload',
    })
  } catch (error) {
    console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
  }
  
});

router.post('/account/signup', async (req, res) => {//sign up
    const { user_email, user_pw, user_name, categories } = req.body;
    try {
      
      let user = await User.findOne({
        where: { email: user_email }
      });
     
      console.log(`select * from users where email='${user_email}'`);
  
      if(user){
        return res.status(202).json({
          code: 202,
          message: '등록된 유저 입니다.',
        });
      }
  
      newUser = await User.create({
        email: user_email,
        pw: user_pw,
        name: user_name,
      });
      console.log(`insert into users values ${newUser}`);
  
      for(let category of categories){
        await newUser.addCategory(category);
        console.log(`insert into user_category values ${newUser.id, category}`);
      }
      
      return res.json({
        code: 200,
        payload: JSON.stringify(newUser),
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    }
  });
  
router.post('/account/auth', async (req, res) => {
    const { user_email, user_pw } = req.body;

    //Try fetching the result from Redis first in case we have it cached
    return redisClient.get(user_email, (error, result) => {
      if(error) {
        throw error;
      }
       // If that key exist in Redis store
      if(result != null){
        const token = jwt.sign({
          id: result.id,
          name: result.name,
        }, process.env.JWT_SECRET, {
          expiresIn: '30m', // 30분
          issuer: 'bookmark-api',
        });

        return res.json({
          code: 200,
          payload: JSON.stringify(result),
          message: '토큰이 발급되었습니다',
          token,
        });
      } else {
        try {
          const user = await User.findOne({
            where: { 
              email: user_email, 
              pw: user_pw,
            },
          });
          if (!user) {
            return res.status(401).json({
              code: 401,
              message: '등록되지 않은 유저입니다.',
            });
          }
          //caching loggin user
          redisClient.set(user_email, JSON.stringify(user)); 
          //signing jwt token for loggin user
          const token = jwt.sign({
            id: user.id,
            name: user.name,
          }, process.env.JWT_SECRET, {
            expiresIn: '30m', // 30분
            issuer: 'bookmark-api',
          });
          console.log(token)
          return res.json({
            code: 200,
            payload: JSON.stringify(user),
            message: '토큰이 발급되었습니다',
            token,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            code: 500,
            message: '서버 에러',
          });
        }
      }
    });

    
 });
  
module.exports = router;

