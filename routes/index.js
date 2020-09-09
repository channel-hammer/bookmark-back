const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { User, Domain } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('index');
});

router.post('/domain', async (req, res, next) => {
  try {
    await Domain.create({
      host: req.body.host,
      type: req.body.type,
      clientSecret: uuidv4(),
    });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;