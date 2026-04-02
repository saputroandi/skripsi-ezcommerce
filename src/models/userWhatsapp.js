module.exports = (sequelize, DataTypes) => {
  const UserWhatsapp = sequelize.define('UserWhatsapp', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    number: { type: DataTypes.STRING, allowNull: false },
  }, { tableName: 'user_whatsapps' });
  return UserWhatsapp;
};
