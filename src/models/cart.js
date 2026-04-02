module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'carts' });
  return Cart;
};
