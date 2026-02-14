module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('voucher_packages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      gameId: { type: Sequelize.INTEGER, allowNull: false, references:{ model:'games', key:'id'}, onDelete:'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      denomination: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('voucher_packages'); }
};
