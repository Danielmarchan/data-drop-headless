import winston, { format } from 'winston'
import expressWinston from 'express-winston'
import {
  type NextFunction,
  type Request,
  type Response,
  type Handler
} from 'express'
import env from '@/env';

class LoggingService {
  logger: winston.Logger;
  loggerMiddleware: Handler;
  
  constructor() {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'set-cookie',
      'proxy-authorization',
      'x-api-key',
    ];

    let loggerOptions = {
      transports: [new winston.transports.Console()],
      format: format.combine(
        format.timestamp(),
        format.json(),
        format.prettyPrint()
      ),
      meta: true,
      headerBlacklist: sensitiveHeaders,
      colorize: false,
      expressFormat: true
    }
    
    if (
      env.NODE_ENV === 'development' ||
      env.NODE_ENV === 'test'
    ) {
      // logger options for error logs
      loggerOptions = {
        ...loggerOptions,
        format: format.combine(
          format.simple(),
          format.align(),
          format.prettyPrint(),
          format.cli({
            colors: {
              info: 'blue',
              error: 'red',
              warn: 'yellow'
            }
          }),
          format.timestamp()
        ),
        colorize: true,
        expressFormat: true
      }
    }
    
    // mock middleware for testing
    let middleware = expressWinston.logger(loggerOptions)
    
    // if not in test environment, use expressWinston logger
    if (process.env.NODE_ENV === 'test') {
      middleware = (_req: Request, _res: Response, next: NextFunction) => {
        next()
      }
    }
    
    this.logger = winston.createLogger(loggerOptions)
    this.loggerMiddleware = middleware
  }
}

export const {logger, loggerMiddleware} = new LoggingService();

export default logger;
