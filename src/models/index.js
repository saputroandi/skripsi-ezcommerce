require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Role = require('./role')(sequelize, DataTypes);
db.User = require('./user')(sequelize, DataTypes);
db.Game = require('./game')(sequelize, DataTypes);
db.VoucherPackage = require('./voucherPackage')(sequelize, DataTypes);
db.Order = require('./order')(sequelize, DataTypes);
db.Genre = require('./genre')(sequelize, DataTypes);
db.GameGenre = require('./gameGenre')(sequelize, DataTypes);

// Associations defined below create required relations for queries & swagger doc referencing
// Associations
// Role has many Users
// User has many Orders
// Game has many VoucherPackages
// Order references User, Game, VoucherPackage

db.Role.hasMany(db.User, { foreignKey: 'roleId' });
db.User.belongsTo(db.Role, { foreignKey: 'roleId' });

db.User.hasMany(db.Order, { foreignKey: 'userId' });
db.Order.belongsTo(db.User, { foreignKey: 'userId' });

db.Game.hasMany(db.VoucherPackage, { foreignKey: 'gameId' });
db.VoucherPackage.belongsTo(db.Game, { foreignKey: 'gameId' });

db.VoucherPackage.hasMany(db.Order, { foreignKey: 'voucherPackageId' });
db.Order.belongsTo(db.VoucherPackage, { foreignKey: 'voucherPackageId' });

// Game <-> Genre (many-to-many)
db.Game.belongsToMany(db.Genre, { through: db.GameGenre, foreignKey: 'gameId' });
db.Genre.belongsToMany(db.Game, { through: db.GameGenre, foreignKey: 'genreId' });

module.exports = db;
