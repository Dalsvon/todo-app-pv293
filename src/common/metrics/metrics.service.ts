
import { Injectable, Inject } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';

// Define injection tokens
export const TODO_REQUESTS_COUNTER = 'TODO_REQUESTS_COUNTER';
export const TODO_REQUEST_DURATION = 'TODO_REQUEST_DURATION';
export const TODO_OPERATIONS_COUNTER = 'TODO_OPERATIONS_COUNTER';
export const TODO_COUNT_GAUGE = 'TODO_COUNT_GAUGE';
export const TODO_ERRORS_COUNTER = 'TODO_ERRORS_COUNTER';

@Injectable()
export class MetricsService {
  constructor(
    @Inject(TODO_REQUESTS_COUNTER)
    private readonly requestsCounter: Counter<string>,
    @Inject(TODO_REQUEST_DURATION)
    private readonly requestDuration: Histogram<string>,
    @Inject(TODO_OPERATIONS_COUNTER)
    private readonly operationsCounter: Counter<string>,
    @Inject(TODO_COUNT_GAUGE)
    private readonly countGauge: Gauge<string>,
    @Inject(TODO_ERRORS_COUNTER)
    private readonly errorsCounter: Counter<string>,
  ) {}

  incrementRequestCounter(method: string, endpoint: string, status: number) {
    this.requestsCounter.inc({
      method,
      endpoint,
      status: status.toString(),
    });
  }

  recordRequestDuration(method: string, endpoint: string, duration: number) {
    this.requestDuration.observe(
      {
        method,
        endpoint,
      },
      duration,
    );
  }

  incrementOperationCounter(operation: string, status: 'success' | 'failure') {
    this.operationsCounter.inc({
      operation,
      status,
    });
  }

  setTodoCount(completed: number, pending: number) {
    this.countGauge.set({ status: 'completed' }, completed);
    this.countGauge.set({ status: 'pending' }, pending);
  }

  incrementErrorCounter(operation: string, errorType: string) {
    this.errorsCounter.inc({
      operation,
      error_type: errorType,
    });
  }
}