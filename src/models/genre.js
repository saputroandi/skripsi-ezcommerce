module.exports = (sequelize, DataTypes) => {
  /**
   * @openapi
   * components:
   *   schemas:
   *     GenreModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         name: { type: string }
   */
  const Genre = sequelize.define('Genre', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, { tableName: 'genres' });

  return Genre;
};
