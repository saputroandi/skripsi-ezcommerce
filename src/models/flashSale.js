module.exports = (sequelize, DataTypes) => {
  const FlashSale = sequelize.define('FlashSale', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    voucherPackageId: { type: DataTypes.INTEGER, allowNull: false },
    discountPercent: { type: DataTypes.INTEGER, allowNull: false },
    startsAt: { type: DataTypes.DATE, allowNull: false },
    endsAt: { type: DataTypes.DATE, allowNull: false }
  }, { tableName: 'flash_sales' });

  /**
   * @openapi
   * components:
   *   schemas:
   *     FlashSaleModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         discountPercent: { type: integer }
   */

  return FlashSale;
};
