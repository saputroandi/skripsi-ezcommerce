module.exports = {
  up: async (queryInterface) => {
    const desc = await queryInterface.describeTable('games');
    if (desc.created_at && !desc.createdAt) {
      await queryInterface.renameColumn('games', 'created_at', 'createdAt');
    }
    if (desc.updated_at && !desc.updatedAt) {
      await queryInterface.renameColumn('games', 'updated_at', 'updatedAt');
    }
  },
  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('games');
    if (desc.createdAt && !desc.created_at) {
      await queryInterface.renameColumn('games', 'createdAt', 'created_at');
    }
    if (desc.updatedAt && !desc.updated_at) {
      await queryInterface.renameColumn('games', 'updatedAt', 'updated_at');
    }
  }
};
