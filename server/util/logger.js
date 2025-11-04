// const logger = console;
const {createLogger, format, transports } = require('winston');
const {combine, timestamp} = format;

const logger = createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    format.json() // Single-line JSON logs for CloudWatch readability
  ),
  transports: [new transports.Console()]
});

const middleware = (req, res, next) => {
  const startTime = Date.now();

  logger.info({
    message: "Request Start",
    method: req.method,
    url: req.originalUrl
  });

  res.on('finish', () => {
    logger.info({
      message: "Request Finish",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      processingTime: Date.now() - startTime
    });
  });

  next();
}

module.exports = {
  logger, middleware
};