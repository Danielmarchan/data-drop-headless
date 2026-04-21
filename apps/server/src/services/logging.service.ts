import winston, { format } from 'winston'
import expressWinston from 'express-winston'
import {
  type NextFunction,
  type Request,
  type Response,
  type Handler
} from 'express'

class LoggingService {
  logger: winston.Logger;
  loggerMiddleware: Handler;
  
  constructor() {
    let loggerOptions = {
      transports: [new winston.transports.Console()],
      format: format.combine(
        format.timestamp(),
        format.json(),
        format.prettyPrint()
      ),
      meta: true,
      colorize: false,
      expressFormat: true
    }
    
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
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
      middleware = (req: Request, res: Response, next: NextFunction) => {
        next()
      }
    }
    
    this.logger = winston.createLogger(loggerOptions)
    this.loggerMiddleware = middleware
  }
}

export const {logger, loggerMiddleware} = new LoggingService();

export default logger;
