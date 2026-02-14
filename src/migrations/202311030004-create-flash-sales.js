module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('flash_sales', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      voucherPackageId: { type: Sequelize.INTEGER, allowNull: false, references:{ model:'voucher_packages', key:'id'}, onDelete:'CASCADE' },
      discountPercent: { type: Sequelize.INTEGER, allowNull: false },
      startsAt: { type: Sequelize.DATE, allowNull: false },
      endsAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('flash_sales'); }
};
