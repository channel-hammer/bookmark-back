const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Feed = require('./feed');
const Book = require('./book');
const Category = require('./category');


const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Feed = Feed;
db.Book = Book;
db.Category = Category;

User.init(sequelize);
Feed.init(sequelize);
Category.init(sequelize);
Book.init(sequelize);

User.associate(db);
Feed.associate(db);
Category.associate(db);
Book.associate(db);

module.exports = db;