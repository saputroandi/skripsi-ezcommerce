module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('orders');
    if (!desc.quantity) {
      await queryInterface.addColumn('orders', 'quantity', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('orders');
    if (desc.quantity) {
      await queryInterface.removeColumn('orders', 'quantity');
    }
  }
};
