module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('games');
    if (!desc.createdAt) {
      await queryInterface.addColumn('games', 'createdAt', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });
    }
    if (!desc.updatedAt) {
      await queryInterface.addColumn('games', 'updatedAt', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('games');
    if (desc.createdAt) await queryInterface.removeColumn('games', 'createdAt');
    if (desc.updatedAt) await queryInterface.removeColumn('games', 'updatedAt');
  }
};
