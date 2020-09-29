const Sequelize = require('sequelize');

module.exports = class Feed extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            author: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            contents: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            imgUri: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            like: {
                type: Sequelize.INTEGER,
                allowNull: false,
                
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Feed',
            tableName: 'feeds',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    };

    static associate(db) {
        db.Feed.belongsToMany(db.User, {
            through: 'like',
        });
        db.Feed.belongsTo(db.Book);
        db.Feed.belongsTo(db.User);
    }
};