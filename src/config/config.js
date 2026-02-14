require('dotenv').config();
module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres'
  },
  test: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ezcommerce_test',
    dialect: 'postgres'
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres'
  }
};
