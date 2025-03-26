import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../modules/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF check for webhook endpoints
    if (req.path.startsWith('/webhooks/')) {
      return next();
    }

    // Skip CSRF check for GET requests
    if (req.method === 'GET') {
      return next();
    }

    // Check for CSRF token in headers
    const csrfToken = req.headers['x-csrf-token'];
    const expectedToken = this.configService.get<string>('CSRF_TOKEN');

    if (!csrfToken) {
      this.logger.warn('CSRF token missing', `IP: ${req.ip}, Path: ${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'CSRF token is required',
        data: null,
      });
    }

    if (csrfToken !== expectedToken) {
      this.logger.warn('Invalid CSRF token', `IP: ${req.ip}, Path: ${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token',
        data: null,
      });
    }

    next();
  }
}
