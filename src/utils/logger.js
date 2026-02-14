const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp, ...meta }) => {
      return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new transports.Console()
  ]
});

module.exports = logger;
