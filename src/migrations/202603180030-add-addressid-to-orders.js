module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('orders');
    if (!desc.addressId && !desc.address_id) {
      await queryInterface.addColumn('orders', 'addressId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('orders');
    if (desc.addressId) {
      await queryInterface.removeColumn('orders', 'addressId');
    } else if (desc.address_id) {
      await queryInterface.removeColumn('orders', 'address_id');
    }
  }
};
