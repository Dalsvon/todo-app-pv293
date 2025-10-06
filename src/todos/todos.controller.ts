import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { TodosService } from './todos.service';
import type { CreateTodoDto, UpdateTodoDto } from './todo.interface';

@Controller('todos')
export class TodosController {
  constructor(
    @InjectPinoLogger(TodosController.name)
    private readonly logger: PinoLogger,
    private readonly todosService: TodosService,
  ) {}

  @Get()
  async findAll() {
    this.logger.info('GET /todos - Fetching all todos');
    const result = await this.todosService.findAll();
    this.logger.info({ count: result.length }, 'GET /todos - Returned todos');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.info({ todoId: id }, 'GET /todos/:id - Fetching todo');
    const result = await this.todosService.findOne(id);
    this.logger.info({ todoId: id }, 'GET /todos/:id - Todo found');
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTodoDto: CreateTodoDto) {
    this.logger.info({ title: createTodoDto.title }, 'POST /todos - Creating new todo');
    const result = await this.todosService.create(createTodoDto);
    this.logger.info({ todoId: result.id }, 'POST /todos - Todo created');
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    this.logger.info({ todoId: id }, 'PUT /todos/:id - Updating todo');
    const result = await this.todosService.update(id, updateTodoDto);
    this.logger.info({ todoId: id }, 'PUT /todos/:id - Todo updated successfully');
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    this.logger.info({ todoId: id }, 'DELETE /todos/:id - Deleting todo');
    await this.todosService.delete(id);
    this.logger.info({ todoId: id }, 'DELETE /todos/:id - Todo deleted successfully');
  }
}