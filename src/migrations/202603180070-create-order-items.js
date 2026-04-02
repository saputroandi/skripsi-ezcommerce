module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      voucherPackageId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'voucher_packages', key: 'id' }, onDelete: 'CASCADE' },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unitPrice: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      totalPrice: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('order_items');
  }
};
