// Import tracing FIRST, before anything else
import './tracing';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { MetricsInterceptor } from './common/metrics/metrics.interceptor';
import { MetricsService } from './common/metrics/metrics.service';
import { TracingInterceptor } from './common/tracing/tracing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Get services
  const metricsService = app.get(MetricsService);

  // Apply interceptors globally
  app.useGlobalInterceptors(
    new TracingInterceptor(),
    new MetricsInterceptor(metricsService),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Metrics available at: http://localhost:${port}/metrics`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`OpenTelemetry tracing enabled`);
}

bootstrap();