module.exports = (sequelize, DataTypes) => {
  /**
   * @openapi
   * components:
   *   schemas:
   *     GameModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         name: { type: string }
   *         slug: { type: string }
   */
  const Game = sequelize.define('Game', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    thumbnailUrl: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, { tableName: 'games' });
  return Game;
};
