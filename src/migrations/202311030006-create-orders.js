module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references:{ model:'users', key:'id'}, onDelete:'CASCADE' },
      gameId: { type: Sequelize.INTEGER, allowNull: false, references:{ model:'games', key:'id'}, onDelete:'CASCADE' },
      voucherPackageId: { type: Sequelize.INTEGER, allowNull: false, references:{ model:'voucher_packages', key:'id'}, onDelete:'CASCADE' },
      uid: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      discountApplied: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      finalPrice: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      status: { type: Sequelize.ENUM('pending','paid','failed'), defaultValue: 'pending' },
      paymentReference: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('orders'); }
};
