module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add slug column if not exists
    const tableDesc = await queryInterface.describeTable('games');
    if (!tableDesc.slug) {
      await queryInterface.addColumn('games', 'slug', { type: Sequelize.STRING, allowNull: true });
      // Populate slug for existing rows
      const [rows] = await queryInterface.sequelize.query('SELECT id, name FROM games');
      for (const r of rows) {
        const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        await queryInterface.sequelize.query(`UPDATE games SET slug = :slug WHERE id = :id`, { replacements: { slug, id: r.id } });
      }
      // Ensure not null
      await queryInterface.changeColumn('games', 'slug', { type: Sequelize.STRING, allowNull: false });
    }
  },
  down: async (queryInterface) => {
    // Optional: remove slug column (only if exists)
    const tableDesc = await queryInterface.describeTable('games');
    if (tableDesc.slug) {
      await queryInterface.removeColumn('games', 'slug');
    }
  }
};
