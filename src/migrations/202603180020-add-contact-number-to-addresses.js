module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('user_addresses');
    if (!desc.contactNumber && !desc.contact_number) {
      await queryInterface.addColumn('user_addresses', 'contactNumber', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('user_addresses');
    if (desc.contactNumber) {
      await queryInterface.removeColumn('user_addresses', 'contactNumber');
    } else if (desc.contact_number) {
      await queryInterface.removeColumn('user_addresses', 'contact_number');
    }
  }
};
