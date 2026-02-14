module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('users');
    if (!desc.name) {
      await queryInterface.addColumn('users', 'name', { type: Sequelize.STRING, allowNull: false, defaultValue: 'User' });
    }
    // Normalize timestamp columns to camelCase like model expects
    if (desc.created_at && !desc.createdAt) {
      await queryInterface.renameColumn('users', 'created_at', 'createdAt');
    }
    if (desc.updated_at && !desc.updatedAt) {
      await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('users');
    if (desc.name) await queryInterface.removeColumn('users', 'name');
    if (desc.createdAt && !desc.created_at) {
      await queryInterface.renameColumn('users', 'createdAt', 'created_at');
    }
    if (desc.updatedAt && !desc.updated_at) {
      await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
    }
  }
};
