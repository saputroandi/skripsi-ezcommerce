const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EzCommerce API',
      version: '1.0.0',
      description: 'API documentation for Game Top-up'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [ { bearerAuth: [] } ],
    tags: [
      { name: 'Auth' },
      { name: 'Games' },
      { name: 'Genres' },
      { name: 'Vouchers' },
      { name: 'Orders' }
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js', './src/controllers/*.js']
};

module.exports = swaggerJsdoc(options);
