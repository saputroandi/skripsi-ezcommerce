module.exports = (sequelize, DataTypes) => {
  /**
   * @openapi
   * components:
   *   schemas:
   *     RoleModel:
   *       type: object
   *       properties:
   *         id: { type: integer }
   *         name: { type: string }
   */
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, {
    tableName: 'roles',
    timestamps: true,
  });

  return Role;
};
