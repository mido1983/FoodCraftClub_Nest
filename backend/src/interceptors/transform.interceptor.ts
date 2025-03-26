import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from '../modules/logger/logger.service';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    
    // Log the request
    this.logger.debug(
      `Request: ${method} ${url}`,
      user ? `User ID: ${user.id}` : undefined,
    );

    return next.handle().pipe(
      map((data) => {
        // Log the response
        this.logger.debug(
          `Response: ${method} ${url}`,
          user ? `User ID: ${user.id}` : undefined,
        );

        // Format the response
        return {
          success: true,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
