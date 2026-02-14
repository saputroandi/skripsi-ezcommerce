module.exports = (sequelize, DataTypes) => {
  const GameGenre = sequelize.define('GameGenre', {
    gameId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    genreId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  }, {
    tableName: 'game_genres',
    timestamps: true,
  });

  return GameGenre;
};
