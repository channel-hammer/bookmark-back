const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');
const fs = require('fs');
const { QueryTypes, Sequelize } = require('sequelize');


const { verifyToken, apiLimiter } = require('./middlewares');
const { User, Book, Category, Feed, sequelize } = require('../models');

const router = express.Router();

router.get('/categories/user/:user_id', verifyToken, async (req, res) => {//아이디 별 카테고리 가져오기
    const id = Number(req.params.user_id);
    try{
      const user = await User.findOne( {
        where: { id },
        include: Category,
        
      });

      if(!user){
        return res.json({
          code: 204,
          message: "null table"
        });
      } 

      console.log(user);
      return res.json({
        code: 200,
        payload: JSON.stringify(user.Categories),
        message: "categories"
      });
      
      
    } catch(error){
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    }
});

router.post('/feeds/like', verifyToken, async (req, res) => {
    const { user_id, feed_id } = req.body;
    try {
      const like = await sequelize.query(
        "SELECT * FROM `like` WHERE UserId=:user_id AND FeedId=:feed_id LIMIT 1",
        {
          replacements: { user_id: user_id, feed_id: feed_id},
          type: QueryTypes.SELECT,
        }
      )
      console.log(like);
      if(like.length == 0){
        await sequelize.query(
          "INSERT INTO `like` (`createdAt`, `updatedAt`, `UserId`, `FeedId`) VALUES (NOW(), NOW(), :user_id, :feed_id)",
          {
            replacements: { user_id: user_id, feed_id: feed_id, },
            type: QueryTypes.INSERT,
          }
        )
        return res.status(201).json({
          code: 201,
          message: `like`,
        });
      }
      return res.status(304).json({
        status: 304,
        message: '이미 좋아요 한 게시글입니다.',
      });
      
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 500,
        message: '서버 에러',
      });
    } 
  });

  router.get('/feeds/:feed_id', verifyToken, async (req, res) => {//피드 정보 가져오기
    const id = Number(req.params.feed_id);
      try{
        const feed = await Feed.findOne( {
          where: { id },  
        });
  
        if(!feed){
          return res.json({
            code: 204,
            message: "null table"
          });
        } 
        
        console.log(feed);
        return res.status(200).json({
          code: 200,
          payload: JSON.stringify(feed),
          message: `feed_id:${id}, feed`,
        });
        
        
      } catch(error){
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: '서버 에러',
        });
      }
  });

  router.get('/feeds/user/:user_id',  verifyToken, async (req, res) => {//유저 아이디로 피드 정보 가져오기
    const UserId = Number(req.params.user_id);
      try{
        const feeds = await Feed.findAll({
          where: { UserId },
          include: Book,
        });
  
        if(!feeds){
          return res.json({
            code: 204,
            message: "Unregistered user"
          });
        } 
        console.log(feeds);
      
        return res.json({
          code: 200,
          payload: JSON.stringify(feeds),
          message: `user_id:${UserId} feeds`
        });
        
        
      } catch(error){
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: '서버 에러',
        }); 
      }
  });

  router.post('/feeds', async (req, res) => {//피드 등록
    const { user_id, feed_author, feed_contents, feed_imgUri, book_author, book_name, book_isbn, book_publisher } = req.body;
    try {
      const user = await User.findOne({
        where: { id: user_id },
      });
      
      if(!user){
        return res.status(401).json({
          code: 401,
          message: '등록되지 않은 유저입니다.'
        });
      }
      let book = await Book.findOne({
        where: { isbn: book_isbn },
      });
      if(!book){
        book = await Book.create({
          author: book_author,
          name: book_name,
          isbn: book_isbn,
          price: 1,
          publisher: book_publisher,
          update: "temp",
        });
      }
      const feed = await Feed.create({
        author: feed_author,
        contents: feed_contents,
        imgUri: feed_imgUri,
        UserId: user_id
      });    
      await user.addBook(book);
      await book.addFeed(feed);
      return res.status(200).json({
        code: 200,
        payload: JSON.stringify(feed),
        message: '피드가 등록되었습니다.'
      });
  
  
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    }
  });

  router.get('/books/user/:user_id', verifyToken, async (req, res) => {//읽은 책 목록
    const id = Number(req.params.user_id);
      try{
        const user = await User.findOne( {
          where: { id },
        });
  
        if(!user){
          return res.json({
            code: 204,
            message: "Unregistered user"
          });
        } 
        console.log(user);
        books = await user.getBooks();
        console.log(books);
        return res.json({
          code: 200,
          payload: JSON.stringify(books),
          message: `user_id:${id} books`
        });
        
        
      } catch(error){
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: '서버 에러',
        }); 
      }
  });

  router.get('/books/:book_id', verifyToken, async (req, res) => {//읽은 책 목록
    const id = Number(req.params.book_id);
      try{
        const book = await Book.findOne( {
          where: { id },
        });
  
        if(!book){
          return res.json({
            code: 204,
            message: "Unregistered book"
          });
        } 
        console.log(user);
        feeds = await user.getFeeds();
        console.log(feeds);
        return res.json({
          code: 200,
          payload: JSON.stringify(feeds),
          message: `book_id:${id} book`
        });
        
        
      } catch(error){
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: '서버 에러',
        }); 
      }
  });
  
  router.post('/books/', verifyToken, async (req, res) => {//읽은 책 등록
  
  });

  module.exports = router;