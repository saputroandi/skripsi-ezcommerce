'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return (async () => {
      const games = await queryInterface.sequelize.query(
        'SELECT id, genre FROM games',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      for (const g of games) {
        const raw = (g.genre || '').trim();
        if (!raw) continue;

        const parts = raw.split(/[,/|]/).map(s => s.trim()).filter(Boolean);
        for (const name of parts) {
          const [rows] = await queryInterface.sequelize.query(
            'INSERT INTO genres (name, "createdAt", "updatedAt") VALUES (:name, NOW(), NOW())\n' +
            'ON CONFLICT (name) DO UPDATE SET "updatedAt" = EXCLUDED."updatedAt"\n' +
            'RETURNING id',
            { replacements: { name } }
          );
          const genreId = rows?.[0]?.id;
          if (!genreId) continue;

          await queryInterface.sequelize.query(
            'INSERT INTO game_genres ("gameId", "genreId", "createdAt", "updatedAt")\n' +
            'VALUES (:gameId, :genreId, NOW(), NOW())\n' +
            'ON CONFLICT ("gameId", "genreId") DO NOTHING',
            { replacements: { gameId: g.id, genreId } }
          );
        }
      }
    })();
  },

  down: (queryInterface) => {
    return (async () => {
      await queryInterface.bulkDelete('game_genres', null, {});
      await queryInterface.bulkDelete('genres', null, {});
    })();
  }
};
