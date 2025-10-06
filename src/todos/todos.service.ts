import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Todo, CreateTodoDto, UpdateTodoDto } from './todo.interface';
import { v4 as uuidv4 } from 'uuid';
import { MetricsService } from '../common/metrics/metrics.service';
import { TracingService } from '../common/tracing/tracing.service';

@Injectable()
export class TodosService {
  constructor(
    @InjectPinoLogger(TodosService.name)
    private readonly logger: PinoLogger,
    private readonly metricsService: MetricsService,
    private readonly tracingService: TracingService,
  ) {}

  private todos: Todo[] = [];

  private updateMetrics() {
    const completed = this.todos.filter((todo) => todo.completed).length;
    const pending = this.todos.filter((todo) => !todo.completed).length;
    this.metricsService.setTodoCount(completed, pending);
  }

  async findAll(): Promise<Todo[]> {
    return this.tracingService.executeInSpan('TodosService.findAll', async (span) => {
      this.logger.info('Fetching all todos');
      this.tracingService.setAttribute(span, 'todos.count', this.todos.length);
      this.logger.debug({ count: this.todos.length }, 'Current todos count');
      this.metricsService.incrementOperationCounter('findAll', 'success');
      return this.todos;
    });
  }

  async findOne(id: string): Promise<Todo> {
    return this.tracingService.executeInSpan('TodosService.findOne', async (span) => {
      this.logger.info({ todoId: id }, 'Fetching todo');
      this.tracingService.setAttribute(span, 'todo.id', id);
      
      try {
        const todo = this.todos.find((todo) => todo.id === id);
        if (!todo) {
          this.logger.warn({ todoId: id }, 'Todo not found');
          this.metricsService.incrementOperationCounter('findOne', 'failure');
          this.metricsService.incrementErrorCounter('findOne', 'NotFound');
          throw new NotFoundException(`Todo with ID ${id} not found`);
        }
        this.logger.debug({ todoId: id, title: todo.title }, 'Found todo');
        this.metricsService.incrementOperationCounter('findOne', 'success');
        this.tracingService.setAttribute(span, 'todo.title', todo.title);
        return todo;
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          this.metricsService.incrementErrorCounter('findOne', 'Unknown');
        }
        throw error;
      }
    });
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.tracingService.executeInSpan('TodosService.create', async (span) => {
      this.logger.info({ title: createTodoDto.title }, 'Creating new todo');
      this.tracingService.setAttribute(span, 'todo.title', createTodoDto.title);
      
      try {
        const newTodo: Todo = {
          id: uuidv4(),
          title: createTodoDto.title,
          description: createTodoDto.description,
          completed: false,
          createdAt: new Date(),
        };
        this.todos.push(newTodo);
        this.logger.info(
          { todoId: newTodo.id, title: newTodo.title },
          'Todo created successfully',
        );
        this.logger.debug({ todo: newTodo }, 'Todo details');
        this.metricsService.incrementOperationCounter('create', 'success');
        this.updateMetrics();
        this.tracingService.setAttribute(span, 'todo.id', newTodo.id);
        this.tracingService.addEvent(span, 'todo_created');
        return newTodo;
      } catch (error) {
        this.metricsService.incrementOperationCounter('create', 'failure');
        this.metricsService.incrementErrorCounter('create', 'Unknown');
        throw error;
      }
    });
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    return this.tracingService.executeInSpan('TodosService.update', async (span) => {
      this.logger.info({ todoId: id, updates: updateTodoDto }, 'Updating todo');
      this.tracingService.setAttribute(span, 'todo.id', id);
      
      try {
        const todo = await this.findOne(id);
        const updatedTodo = {
          ...todo,
          ...updateTodoDto,
        };
        const index = this.todos.findIndex((t) => t.id === id);
        this.todos[index] = updatedTodo;
        this.logger.info({ todoId: id }, 'Todo updated successfully');
        this.metricsService.incrementOperationCounter('update', 'success');
        this.updateMetrics();
        this.tracingService.addEvent(span, 'todo_updated');
        return updatedTodo;
      } catch (error) {
        this.metricsService.incrementOperationCounter('update', 'failure');
        if (!(error instanceof NotFoundException)) {
          this.metricsService.incrementErrorCounter('update', 'Unknown');
        }
        throw error;
      }
    });
  }

  async delete(id: string): Promise<void> {
    return this.tracingService.executeInSpan('TodosService.delete', async (span) => {
      this.logger.info({ todoId: id }, 'Deleting todo');
      this.tracingService.setAttribute(span, 'todo.id', id);
      
      try {
        const index = this.todos.findIndex((todo) => todo.id === id);
        if (index === -1) {
          this.logger.warn({ todoId: id }, 'Todo not found for deletion');
          this.metricsService.incrementOperationCounter('delete', 'failure');
          this.metricsService.incrementErrorCounter('delete', 'NotFound');
          throw new NotFoundException(`Todo with ID ${id} not found`);
        }
        this.todos.splice(index, 1);
        this.logger.info({ todoId: id }, 'Todo deleted successfully');
        this.logger.debug(
          { remainingCount: this.todos.length },
          'Remaining todos count',
        );
        this.metricsService.incrementOperationCounter('delete', 'success');
        this.updateMetrics();
        this.tracingService.addEvent(span, 'todo_deleted');
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          this.metricsService.incrementErrorCounter('delete', 'Unknown');
        }
        throw error;
      }
    });
  }
}