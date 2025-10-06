import { Injectable } from '@nestjs/common';
import { trace, Span, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class TracingService {
  private readonly tracer = trace.getTracer('todo-app');

  // Execute a function within a span
  async executeInSpan<T>(
    spanName: string,
    fn: (span: Span) => Promise<T>,
  ): Promise<T> {
    const span = this.tracer.startSpan(spanName);
    
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  // Add event to span
  addEvent(span: Span, name: string): void {
    if (span) {
      span.addEvent(name);
    }
  }

  // Set attribute on span
  setAttribute(span: Span, key: string, value: any): void {
    if (span) {
      span.setAttribute(key, value);
    }
  }
}