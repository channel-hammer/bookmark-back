const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');
const fs = require('fs');
const { QueryTypes, Sequelize } = require('sequelize');


const { verifyToken, apiLimiter } = require('./middlewares');
const { User, Book, Category, Feed, sequelize } = require('../models');

const router = express.Router();


router.post('/account/signup', async (req, res) => {
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
 });
  
module.exports = router;

