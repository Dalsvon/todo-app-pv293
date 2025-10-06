import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { trace } from '@opentelemetry/api';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  private readonly tracer = trace.getTracer('todo-app');

  intercept(execContext: ExecutionContext, next: CallHandler): Observable<any> {
    const request = execContext.switchToHttp().getRequest();
    const { method, url } = request;
    const controllerName = execContext.getClass().name;
    const handlerName = execContext.getHandler().name;

    const spanName = `${method} ${url}`;
    const span = this.tracer.startSpan(spanName);

    span.setAttribute('http.method', method);
    span.setAttribute('http.url', url);
    span.setAttribute('controller', controllerName);
    span.setAttribute('handler', handlerName);

    return next.handle().pipe(
      tap(() => {
        const response = execContext.switchToHttp().getResponse();
        span.setAttribute('http.status_code', response.statusCode);
        span.end();
      }),
      catchError((error) => {
        span.recordException(error);
        span.setAttribute('error', true);
        span.end();
        return throwError(() => error);
      }),
    );
  }
}