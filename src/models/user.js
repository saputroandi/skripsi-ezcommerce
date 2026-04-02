module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    googleId: { type: DataTypes.STRING, allowNull: true },
    roleId: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'users' });

  /**
   * @openapi
   * components:
   *   schemas:
   *     UserModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         email: { type: string }
   *         role: { type: string }
   */

  return User;
};
