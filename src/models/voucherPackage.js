module.exports = (sequelize, DataTypes) => {
  const VoucherPackage = sequelize.define('VoucherPackage', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    denomination: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false }
  }, { tableName: 'voucher_packages' });

  /**
   * @openapi
   * components:
   *   schemas:
   *     VoucherPackageModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         denomination: { type: integer }
   */

  return VoucherPackage;
};
