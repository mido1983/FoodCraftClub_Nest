import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../modules/logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorMessage = 
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message || 'Internal server error';

    // Log the error
    this.logger.error(
      `Exception: ${request.method} ${request.url} - ${status} - ${errorMessage}`,
      exception.stack,
      request.user ? `User ID: ${request.user.id}` : undefined,
    );

    // Format the error response
    response.status(status).json({
      success: false,
      message: errorMessage,
      data: null,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
