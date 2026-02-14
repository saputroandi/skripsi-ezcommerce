'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return (async () => {
      await queryInterface.createTable('genres', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      });

      await queryInterface.createTable('game_genres', {
        gameId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'games', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        genreId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'genres', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      });

      await queryInterface.addIndex('game_genres', ['gameId']);
      await queryInterface.addIndex('game_genres', ['genreId']);
    })();
  },

  down: (queryInterface) => {
    return (async () => {
      await queryInterface.dropTable('game_genres');
      await queryInterface.dropTable('genres');
    })();
  }
};
