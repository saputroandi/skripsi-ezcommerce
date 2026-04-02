module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    voucherPackageId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  }, { tableName: 'cart_items' });
  return CartItem;
};
