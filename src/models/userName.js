module.exports = (sequelize, DataTypes) => {
  const UserName = sequelize.define('UserName', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
  }, { tableName: 'user_names' });
  return UserName;
};
