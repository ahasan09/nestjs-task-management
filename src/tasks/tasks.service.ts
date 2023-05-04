import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private repository: Repository<Task>
    ) { }

    async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
        const { status, search } = filterDto;

        const query = this.repository.createQueryBuilder('task');

        if (status) {
            query.andWhere('status = :status', { status })
        }

        if (search) {
            query.andWhere(
                '(LOWER(title) LIKE LOWER(:search) OR LOWER(description) LIKE LOWER(:search))',
                { search: `%${search}%` })
        }

        const tasks = await query.getMany();
        return tasks;
    }

    async getTaskById(id: string): Promise<Task> {
        const task = await this.repository.findOneBy({ id });

        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }

        return task;
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const { title, description } = createTaskDto;

        const task = this.repository.create({
            title,
            description,
            status: TaskStatus.OPEN
        });

        await this.repository.save(task);
        return task;
    }

    async deleteTask(id: string): Promise<void> {
        const result = await this.repository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
    }

    async updateTask(id: string, status: TaskStatus): Promise<Task> {
        const task = await this.getTaskById(id);
        task.status = status;

        await this.repository.save(task);
        return task;
    }
}
