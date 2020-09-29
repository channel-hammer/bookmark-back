const Sequelize = require('sequelize');

module.exports = class Book extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            name: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            author: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            price: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            publisher: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            update: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            isbn: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            imageLink: {
                type: Sequelize.STRING(200),
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Book',
            tableName: 'books',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    };

    static associate(db) {
        db.Book.belongsToMany(db.User, {
            through: 'book_read'
        });
        db.Book.belongsToMany(db.Category, {
            through: 'book_category'
        });
        db.Book.hasMany(db.Feed);
    }
};