module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('user_addresses');
    if (!desc.isDefault && !desc.is_default) {
      await queryInterface.addColumn('user_addresses', 'isDefault', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('user_addresses');
    if (desc.isDefault) {
      await queryInterface.removeColumn('user_addresses', 'isDefault');
    } else if (desc.is_default) {
      await queryInterface.removeColumn('user_addresses', 'is_default');
    }
  }
};
