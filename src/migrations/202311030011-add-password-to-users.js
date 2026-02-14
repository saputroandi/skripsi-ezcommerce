module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('users');
    if (!desc.password) {
      await queryInterface.addColumn('users', 'password', { type: Sequelize.STRING, allowNull: false, defaultValue: '$2a$10$placeholderhashplaceholderhashpl' });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('users');
    if (desc.password) {
      await queryInterface.removeColumn('users', 'password');
    }
  }
};
