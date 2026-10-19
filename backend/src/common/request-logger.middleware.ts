import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

// Logs one line per request: "POST /auth/signin 200 - 254ms"
// Bodies are never logged, they contain passwords.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // 'finish' fires after the response is sent, so the status code is final
  res.on('finish', () => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`;
    if (res.statusCode >= 500) logger.error(message);
    else if (res.statusCode >= 400) logger.warn(message);
    else logger.log(message);
  });

  next();
}
