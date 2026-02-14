'use strict';

module.exports = {
  up: (queryInterface) => {
    return (async () => {
      const desc = await queryInterface.describeTable('games');
      if (desc.genre) {
        await queryInterface.removeColumn('games', 'genre');
      }
    })();
  },

  down: (queryInterface, Sequelize) => {
    return (async () => {
      const desc = await queryInterface.describeTable('games');
      if (!desc.genre) {
        await queryInterface.addColumn('games', 'genre', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    })();
  }
};
