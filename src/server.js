require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { sequelize } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(morgan('dev'));
app.use(expressLayouts);
app.set('layout', 'layout');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15*60*1000,
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100
});
app.use(limiter);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/games', require('./routes/game.routes'));
app.use('/api/genres', require('./routes/genre.routes'));
app.use('/api/vouchers', require('./routes/voucher.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/', require('./routes/web.routes'));

app.use((req,res,next)=>{ if(!res.headersSent) return res.status(404).json({ message: 'Not Found' }); });

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 3000;
sequelize.authenticate().then(()=>{
  logger.info('Database connected');
  app.listen(PORT, ()=> logger.info(`Server running on port ${PORT}`));
}).catch(err=>{
  logger.error('DB connection failed', err);
});
