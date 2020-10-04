const Sequelize = require('sequelize');
const fs = require('fs');

module.exports = class Category extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Category',
            tableName: 'categories',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    };

    static associate(db) {
        db.Category.belongsToMany(db.User, {
            through: 'user_category',
        })
        db.Category.belongsToMany(db.Book, {
            through: 'book_category',
        })
        db.Category.hasMany(db.Book);
    }
};