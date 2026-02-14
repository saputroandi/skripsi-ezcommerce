module.exports = {
  up: async (queryInterface) => {
    const desc = await queryInterface.describeTable('games');
    const useCamel = !!desc.createdAt;
    const now = new Date();

    const base = [
      { name:'Mobile Legends: Bang Bang', slug:'mlbb', genres:['MOBA'], thumbnailUrl:'https://placehold.co/300x160?text=MLBB' },
      { name:'Free Fire', slug:'free-fire', genres:['Battle Royale'], thumbnailUrl:'https://placehold.co/300x160?text=Free+Fire' },
      { name:'PUBG Mobile', slug:'pubg', genres:['Battle Royale'], thumbnailUrl:'https://placehold.co/300x160?text=PUBG' },
      { name:'Genshin Impact', slug:'genshin-impact', genres:['Action RPG'], thumbnailUrl:'https://placehold.co/300x160?text=Genshin' },
      { name:'Roblox', slug:'roblox', genres:['Sandbox'], thumbnailUrl:'https://placehold.co/300x160?text=Roblox' }
    ];

    // remove existing by slug
    await queryInterface.bulkDelete('games', { slug: base.map(r=>r.slug) });

    const rows = base.map(r => ({
      name: r.name,
      slug: r.slug,
      thumbnailUrl: r.thumbnailUrl,
      [useCamel ? 'createdAt' : 'created_at']: now,
      [useCamel ? 'updatedAt' : 'updated_at']: now
    }));

    await queryInterface.bulkInsert('games', rows);

    // Re-fetch inserted games to map slug -> id
    const insertedGames = await queryInterface.sequelize.query(
      'SELECT id, slug FROM games WHERE slug IN (:slugs)',
      {
        type: queryInterface.sequelize.QueryTypes.SELECT,
        replacements: { slugs: base.map(r=>r.slug) }
      }
    );
    const gameIdBySlug = new Map(insertedGames.map(g => [g.slug, g.id]));

    // Upsert genres + connect
    for (const g of base) {
      const gameId = gameIdBySlug.get(g.slug);
      if (!gameId) continue;

      for (const name of (g.genres || [])) {
        const [genreRows] = await queryInterface.sequelize.query(
          'INSERT INTO genres (name, "createdAt", "updatedAt") VALUES (:name, NOW(), NOW())\n' +
          'ON CONFLICT (name) DO UPDATE SET "updatedAt" = EXCLUDED."updatedAt"\n' +
          'RETURNING id',
          { replacements: { name } }
        );

        const genreId = genreRows?.[0]?.id;
        if (!genreId) continue;

        await queryInterface.sequelize.query(
          'INSERT INTO game_genres ("gameId", "genreId", "createdAt", "updatedAt")\n' +
          'VALUES (:gameId, :genreId, NOW(), NOW())\n' +
          'ON CONFLICT ("gameId", "genreId") DO NOTHING',
          { replacements: { gameId, genreId } }
        );
      }
    }
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('game_genres', null, {});
    await queryInterface.bulkDelete('genres', null, {});
    await queryInterface.bulkDelete('games', null, {});
  }
};
