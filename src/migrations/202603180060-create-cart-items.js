module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cart_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      cartId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'carts', key: 'id' }, onDelete: 'CASCADE' },
      voucherPackageId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'voucher_packages', key: 'id' }, onDelete: 'CASCADE' },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('cart_items');
  }
};
