import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { MetricsModule } from 'src/common/metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  controllers: [TodosController],
  providers: [TodosService]
})
export class TodosModule {}
