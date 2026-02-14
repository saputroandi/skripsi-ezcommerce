module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('articles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      authorId: { type: Sequelize.INTEGER, allowNull: false, references:{ model:'users', key:'id'}, onDelete:'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      body: { type: Sequelize.TEXT, allowNull: false },
      publishedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('articles'); }
};
