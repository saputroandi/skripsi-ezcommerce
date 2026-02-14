module.exports = (sequelize, DataTypes) => {
  /**
   * @openapi
   * components:
   *   schemas:
   *     ArticleModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         title: { type: string }
   */
  const Article = sequelize.define('Article', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    publishedAt: { type: DataTypes.DATE }
  }, { tableName: 'articles' });
  return Article;
};
