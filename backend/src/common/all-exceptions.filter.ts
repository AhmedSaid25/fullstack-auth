import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

// @Catch() with no arguments -> catches every error thrown anywhere in a request
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Expected errors (400, 401, 409...) keep their message.
    // Unexpected ones are logged with the stack and the client only sees a generic message.
    const body = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    if (!isHttpException) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      ...(typeof body === 'string' ? { message: body } : body),
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
