module.exports = {
  up: async (queryInterface) => {
    const desc = await queryInterface.describeTable('voucher_packages');
    const useCamel = !!desc.createdAt;
    const [games] = await queryInterface.sequelize.query('SELECT id, slug FROM games');
    const find = slug => games.find(r=>r.slug===slug)?.id;
    const now = new Date();
    const rows = [
      { gameId: find('hydrating-serum'), name:'Hydrating Serum 30ml', denomination:30, price: '129000' },
      { gameId: find('hydrating-serum'), name:'Hydrating Serum 50ml', denomination:50, price: '189000' },
      { gameId: find('gentle-cleanser'), name:'Gentle Cleanser 100ml', denomination:100, price: '99000' },
      { gameId: find('daily-sunscreen'), name:'Daily Sunscreen 40ml', denomination:40, price: '119000' },
      { gameId: find('barrier-moisturizer'), name:'Barrier Moisturizer 50gr', denomination:50, price: '149000' },
      { gameId: find('tinted-lip-balm'), name:'Tinted Lip Balm - Rose', denomination:1, price: '79000' }
    ].map(r => ({
      ...r,
      [useCamel ? 'createdAt' : 'created_at']: now,
      [useCamel ? 'updatedAt' : 'updated_at']: now
    }));
    await queryInterface.bulkDelete('voucher_packages', { name: rows.map(r=>r.name) });
    await queryInterface.bulkInsert('voucher_packages', rows);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('voucher_packages', null, {});
  }
};
