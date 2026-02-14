module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('games', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      thumbnailUrl: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      genre: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('games'); }
};
