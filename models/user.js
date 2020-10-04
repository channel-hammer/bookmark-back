const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            pw: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            profileUri: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    };

    static associate(db) {
        db.User.belongsToMany(db.Feed, {
            through: 'like',
        });
        db.User.hasMany(db.Feed);
        db.User.belongsToMany(db.Book, {
            through: 'book_read',
        });
        db.User.belongsToMany(db.Book, {
            through: 'wish'
        })

        db.User.belongsToMany(db.Category, {
            through: 'user_category',
        });

    }
};