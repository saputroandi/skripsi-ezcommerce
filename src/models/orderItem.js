module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    voucherPackageId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  }, { tableName: 'order_items' });
  return OrderItem;
};
