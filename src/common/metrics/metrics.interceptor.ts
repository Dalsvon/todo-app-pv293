import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, route } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const duration = (Date.now() - startTime) / 1000;
        const endpoint = route?.path || request.url;

        this.metricsService.incrementRequestCounter(
          method,
          endpoint,
          response.statusCode,
        );
        this.metricsService.recordRequestDuration(method, endpoint, duration);
      }),
      catchError((error) => {
        const duration = (Date.now() - startTime) / 1000;
        const endpoint = route?.path || request.url;
        const response = context.switchToHttp().getResponse();

        this.metricsService.incrementRequestCounter(
          method,
          endpoint,
          error.status || 500,
        );
        this.metricsService.recordRequestDuration(method, endpoint, duration);

        return throwError(() => error);
      }),
    );
  }
}