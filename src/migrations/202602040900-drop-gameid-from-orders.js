
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Guard: only attempt when column exists
    const desc = await queryInterface.describeTable('orders');
    if (desc.gameId || desc.game_id) {
      await queryInterface.removeColumn('orders', desc.gameId ? 'gameId' : 'game_id');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('orders');
    if (!desc.gameId && !desc.game_id) {
      await queryInterface.addColumn('orders', 'gameId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'games', key: 'id' },
        onDelete: 'CASCADE'
      });
    }
  }
};
