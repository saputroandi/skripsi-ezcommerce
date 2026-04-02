module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('users');
    if (!desc.googleId && !desc.google_id) {
      await queryInterface.addColumn('users', 'googleId', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('users');
    if (desc.googleId) {
      await queryInterface.removeColumn('users', 'googleId');
    } else if (desc.google_id) {
      await queryInterface.removeColumn('users', 'google_id');
    }
  }
};
