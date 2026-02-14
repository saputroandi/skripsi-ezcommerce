module.exports = (sequelize, DataTypes) => {
  /**
   * @openapi
   * components:
   *   schemas:
   *     OrderModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         status: { type: string }
   *         whatsapp: { type: string }
   *         transactionCode: { type: string }
   */
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    voucherPackageId: { type: DataTypes.INTEGER, allowNull: false },
    uid: { type: DataTypes.STRING, allowNull: false },
    whatsapp: { type: DataTypes.STRING },
    transactionCode: { type: DataTypes.STRING },
    paymentProof: { type: DataTypes.STRING },
    paymentProofUploadedAt: { type: DataTypes.DATE },
    finalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.ENUM('pending','paid','failed'), defaultValue: 'pending' }
  }, { tableName: 'orders' });
  return Order;
};
