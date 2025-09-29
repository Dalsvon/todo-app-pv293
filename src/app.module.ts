import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { LoggerModule } from './common/logger/logger.module';
import { MetricsModule } from './common/metrics/metrics.module';

@Module({
  imports: [TodosModule, LoggerModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
