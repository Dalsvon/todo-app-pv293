import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge, register } from 'prom-client';
import {
  MetricsService,
  TODO_REQUESTS_COUNTER,
  TODO_REQUEST_DURATION,
  TODO_OPERATIONS_COUNTER,
  TODO_COUNT_GAUGE,
  TODO_ERRORS_COUNTER,
} from './metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'todo_app_',
        },
      },
    }),
  ],
  providers: [
    {
      provide: TODO_REQUESTS_COUNTER,
      useFactory: () => {
        return new Counter({
          name: 'todo_requests_total',
          help: 'Total number of TODO requests',
          labelNames: ['method', 'endpoint', 'status'],
          registers: [register],
        });
      },
    },
    {
      provide: TODO_REQUEST_DURATION,
      useFactory: () => {
        return new Histogram({
          name: 'todo_request_duration_seconds',
          help: 'Duration of TODO requests in seconds',
          labelNames: ['method', 'endpoint'],
          buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
          registers: [register],
        });
      },
    },
    {
      provide: TODO_OPERATIONS_COUNTER,
      useFactory: () => {
        return new Counter({
          name: 'todo_operations_total',
          help: 'Total number of TODO operations',
          labelNames: ['operation', 'status'],
          registers: [register],
        });
      },
    },
    {
      provide: TODO_COUNT_GAUGE,
      useFactory: () => {
        return new Gauge({
          name: 'todo_count',
          help: 'Current number of TODOs',
          labelNames: ['status'],
          registers: [register],
        });
      },
    },
    {
      provide: TODO_ERRORS_COUNTER,
      useFactory: () => {
        return new Counter({
          name: 'todo_errors_total',
          help: 'Total number of TODO errors',
          labelNames: ['operation', 'error_type'],
          registers: [register],
        });
      },
    },
    MetricsService,
  ],
  exports: [PrometheusModule, MetricsService],
})
export class MetricsModule {}