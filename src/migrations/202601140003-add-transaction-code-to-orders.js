module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = 'orders';
    const desc = await queryInterface.describeTable(table);

    if (!desc.transactionCode && !desc.transaction_code) {
      await queryInterface.addColumn(table, 'transactionCode', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }

    // Backfill existing rows with a deterministic-ish code based on time + id.
    // Format: TRX-YYYYMMDDHHmmss-<GAME>-<ID>
    // Use raw SQL to avoid loading all rows into app memory.
    const hasCamel = !!(await queryInterface.describeTable(table)).transactionCode;
    const col = hasCamel ? 'transactionCode' : 'transaction_code';

    // Only backfill NULL
    // Note: using Postgres functions.
    await queryInterface.sequelize.query(`
      UPDATE ${table}
      SET "${col}" = (
        'TRX-' || to_char("createdAt", 'YYYYMMDDHH24MISS') ||
        COALESCE('-' || CAST("gameId" AS TEXT), '') ||
        '-' || CAST(id AS TEXT)
      )
      WHERE "${col}" IS NULL;
    `);

    // Make it non-null after backfill if desired; keep nullable to be safe with future custom generation.
    // If you want strict non-null, uncomment below:
    // await queryInterface.changeColumn(table, col, { type: Sequelize.STRING, allowNull: false, unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    const table = 'orders';
    const desc = await queryInterface.describeTable(table);
    if (desc.transactionCode) {
      await queryInterface.removeColumn(table, 'transactionCode');
    } else if (desc.transaction_code) {
      await queryInterface.removeColumn(table, 'transaction_code');
    }
  },
};
