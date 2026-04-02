module.exports = (sequelize, DataTypes) => {
  const UserAddress = sequelize.define('UserAddress', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    recipientName: { type: DataTypes.STRING, allowNull: false },
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    contactNumber: { type: DataTypes.STRING },
    label: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING },
    postalCode: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT },
  }, { tableName: 'user_addresses' });
  return UserAddress;
};
