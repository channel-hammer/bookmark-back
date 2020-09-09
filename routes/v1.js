const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');
const fs = require('fs');


const { verifyToken, apiLimiter } = require('./middlewares');
const { User, Book, Category, Feed } = require('../models');

const router = express.Router();

// categories table init
// router.use( async (req, res) => {
//   let text = fs.readFileSync('./public/category.txt', 'utf-8');
//   text = text.split('\n');
//   console.log(text)
//   for (let line of text ){
//     if(line.charAt(3) == '\t'){
//       console.log(line);
//       let category_id = Number(line.substring(0, 3))
//       let category_name = line.substring(3).trim();
//       let category = await Category.create({
//         id: category_id,
//         name: category_name,
//       });    
//     } 
//   }
// });

router.get('/board/categories/user/:user_id', verifyToken, async (req, res) => {//아이디 별 카테고리 가져오기
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

router.get('/board/feeds/:feed_id', verifyToken, async (req, res) => {//피드 정보 가져오기
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
      return res.json({
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

router.get('/board/feeds/user/:user_id',  verifyToken, async (req, res) => {//피드 정보 가져오기
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
      feeds = await user.getFeeds();
      console.log(feeds);
      return res.json({
        code: 200,
        payload: JSON.stringify(feeds),
        message: `user_id:${id} feeds`
      });
      
      
    } catch(error){
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      }); 
    }
});

router.post('/board/feeds', async (req, res) => {//피드 등록
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
    
    const feed = await Feed.create({
      author: feed_author,
      contents: feed_contents,
      imgUri: feed_imgUri,
    });
    const book = await Book.create({
      author: book_author,
      name: book_name,
      isbn: book_isbn,
      price: 1,
      publisher: book_publisher,
      update: "temp",
    });
    await user.addBook(book);
    await user.addFeed(feed);
    await book.addFeed(feed);
    return res.status(200).json({
      code: 200,
      message: '피드가 등록되었습니다.'
    });


  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

router.put('/board/feeds', async (req, res) => {//피드 업데이트

});

router.delete('/board/feeds', async (req, res) => {//피드 삭제

});

router.get('/board/books/user/:user_id', verifyToken, async (req, res) => {//읽은 책 목록
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

router.get('/board/books/:book_id', verifyToken, async (req, res) => {//읽은 책 목록
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

router.post('/board/books/', verifyToken, async (req, res) => {//읽은 책 등록

});

router.post('/user/account/signup', async (req, res) => {
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

router.post('/user/account/auth', async (req, res) => {
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