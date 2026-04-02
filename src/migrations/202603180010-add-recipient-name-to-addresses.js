module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('user_addresses');
    if (!desc.recipientName && !desc.recipient_name) {
      await queryInterface.addColumn('user_addresses', 'recipientName', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Penerima',
      });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('user_addresses');
    if (desc.recipientName) {
      await queryInterface.removeColumn('user_addresses', 'recipientName');
    } else if (desc.recipient_name) {
      await queryInterface.removeColumn('user_addresses', 'recipient_name');
    }
  }
};
