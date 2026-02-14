'use strict';

/**
 * Create roles table (user/admin), add users.roleId FK, backfill from legacy users.role enum,
 * then drop users.role.
 */
module.exports = {
  up: function (queryInterface, Sequelize) {
    return (async () => {
      // 1) Create roles table
      await queryInterface.createTable('roles', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      });

      // 2) Seed default roles
      const now = new Date();
      await queryInterface.bulkInsert('roles', [
        { name: 'user', createdAt: now, updatedAt: now },
        { name: 'admin', createdAt: now, updatedAt: now },
      ]);

      // 3) Add roleId to users
      await queryInterface.addColumn('users', 'roleId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      // 4) Backfill roleId from existing users.role (enum)
      const [rows] = await queryInterface.sequelize.query('SELECT id, role FROM users');
      for (const r of rows) {
        const roleName = (r.role === 'admin') ? 'admin' : 'user';
        const [[roleRow]] = await queryInterface.sequelize.query(
          `SELECT id FROM roles WHERE name='${roleName}' LIMIT 1`
        );
        if (roleRow?.id) {
          await queryInterface.sequelize.query(
            `UPDATE users SET "roleId"=${roleRow.id} WHERE id=${r.id}`
          );
        }
      }

      // 5) Make roleId NOT NULL
      await queryInterface.changeColumn('users', 'roleId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });

      // 6) Drop legacy role column
      const usersDesc = await queryInterface.describeTable('users');
      if (usersDesc.role) {
        await queryInterface.removeColumn('users', 'role');
      }

      // 7) Drop enum type if exists (Postgres)
      try {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
      } catch (_) {}
    })();
  },

  down: function () {
    throw new Error('This migration is irreversible. Restore from backup if needed.');
  },
};
