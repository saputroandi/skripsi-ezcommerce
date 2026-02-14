'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return (async () => {
      const desc = await queryInterface.describeTable('games');
      if (!desc.isActive) {
        await queryInterface.addColumn('games', 'isActive', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
      }
    })();
  },

  down: (queryInterface) => {
    return (async () => {
      const desc = await queryInterface.describeTable('games');
      if (desc.isActive) {
        await queryInterface.removeColumn('games', 'isActive');
      }
    })();
  }
};
