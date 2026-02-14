const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, sequelize) => {
    // sequelize-cli v6 passes (queryInterface, Sequelize)
    const desc = await queryInterface.describeTable('users');
    const useCamel = !!desc.createdAt;
    const now = new Date();

    const [[roleRow]] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name='user' LIMIT 1");
    if (!roleRow) throw new Error('Role seed missing: user');

    const users = [
      { email: 'user1@example.com', password: 'User123!' },
      { email: 'user2@example.com', password: 'User123!' },
    ];

    const rows = [];

    for (const u of users) {
      const [[exists]] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email='${u.email.replace(/'/g, "''")}'`
      );
      if (exists) continue;

      const hashed = await bcrypt.hash(u.password, 10);
      const row = {
        email: u.email,
        roleId: roleRow.id,
      };

      if (desc.username) row.username = u.email.split('@')[0];
      if (desc.name) row.name = u.email.split('@')[0];

      if (desc.password) row.password = hashed;
      if (desc.password_hash) row.password_hash = hashed;

      row[useCamel ? 'createdAt' : 'created_at'] = now;
      row[useCamel ? 'updatedAt' : 'updated_at'] = now;

      rows.push(row);
    }

    if (rows.length) {
      await queryInterface.bulkInsert('users', rows);
    }
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: ['user1@example.com', 'user2@example.com'],
    });
  },
};
