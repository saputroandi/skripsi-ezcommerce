module.exports = {
  up: async (queryInterface) => {
    const desc = await queryInterface.describeTable('voucher_packages');
    const useCamel = !!desc.createdAt;
    const [games] = await queryInterface.sequelize.query('SELECT id, slug FROM games');
    const find = slug => games.find(r=>r.slug===slug)?.id;
    const now = new Date();
    const rows = [
      { gameId: find('mlbb'), name:'Diamonds 86', denomination:86, price: '20000' },
      { gameId: find('mlbb'), name:'Diamonds 172', denomination:172, price: '39000' },
      { gameId: find('free-fire'), name:'Diamonds 100', denomination:100, price: '15000' },
      { gameId: find('pubg'), name:'UC 60', denomination:60, price: '14000' },
      { gameId: find('genshin-impact'), name:'Genesis Crystal 300', denomination:300, price: '75000' },
      { gameId: find('roblox'), name:'Robux 80', denomination:80, price: '15000' }
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
