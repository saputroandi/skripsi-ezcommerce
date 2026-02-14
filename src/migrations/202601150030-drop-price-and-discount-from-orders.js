'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = 'orders';

    const desc = await queryInterface.describeTable(table);

    if (desc.discountApplied) {
      await queryInterface.removeColumn(table, 'discountApplied');
    }

    if (desc.price) {
      await queryInterface.removeColumn(table, 'price');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = 'orders';
    const desc = await queryInterface.describeTable(table);

    if (!desc.price) {
      await queryInterface.addColumn(table, 'price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }

    if (!desc.discountApplied) {
      await queryInterface.addColumn(table, 'discountApplied', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      });
    }
  },
};
