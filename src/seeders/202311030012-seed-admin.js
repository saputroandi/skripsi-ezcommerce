const bcrypt = require('bcryptjs');
module.exports = {
  up: async (queryInterface) => {
    const [[exists]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email='admin@example.com'");
    if (exists) return;

    const desc = await queryInterface.describeTable('users');
    const useCamel = !!desc.createdAt;
    const now = new Date();
    const hashed = await bcrypt.hash('Admin123!', 10);

    // resolve admin roleId
    const [[roleRow]] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name='admin' LIMIT 1");
    if (!roleRow) throw new Error('Role seed missing: admin');

    const row = {
      email:'admin@example.com',
      roleId: roleRow.id,
    };
    if (desc.username) row.username = 'admin';
    if (desc.name) row.name = 'Admin';
    if (desc.password) row.password = hashed;
    if (desc.password_hash) row.password_hash = hashed;
    row[useCamel ? 'createdAt':'created_at'] = now;
    row[useCamel ? 'updatedAt':'updated_at'] = now;
    await queryInterface.bulkInsert('users', [ row ]);
  },
  down: async (queryInterface) => { await queryInterface.bulkDelete('users', { email:'admin@example.com' }); }
};
