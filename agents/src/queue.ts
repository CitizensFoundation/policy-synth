import winston from 'winston';

import './problems/problemsProcessor.js'
import './solutions/solutions.js'
import './policies/policies.js'

const logger = winston.createLogger({
  level: process.env.WORKER_LOG_LEVEL || 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

process.on("uncaughtException", function (err) {
  logger.error(err);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at: Promise");
});

export { logger };
