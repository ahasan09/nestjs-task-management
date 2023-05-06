import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
    private logger = new Logger('TasksService', { timestamp: true });

    constructor(
        @InjectRepository(Task)
        private repository: Repository<Task>
    ) { }

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto;

        const query = this.repository.createQueryBuilder('task');
        query.where({ user });

        if (status) {
            query.andWhere('status = :status', { status })
        }

        if (search) {
            query.andWhere(
                '(LOWER(title) LIKE LOWER(:search) OR LOWER(description) LIKE LOWER(:search))',
                { search: `%${search}%` })
        }

        try {
            const tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this.logger.error(
                `Failed to get tasks for user "${user.username}". Filters: ${JSON.stringify(filterDto)}`,
                error.stack
            );
            throw new InternalServerErrorException();
        }
    }

    async getTaskById(id: string, user: User): Promise<Task> {
        const task = await this.repository.findOneBy({ id, user });

        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }

        return task;
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;

        const task = this.repository.create({
            title,
            description,
            status: TaskStatus.OPEN,
            user
        });

        await this.repository.save(task);
        return task;
    }

    async deleteTask(id: string, user: User): Promise<void> {
        const result = await this.repository.delete({ id, user });

        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
    }

    async updateTask(id: string, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;

        await this.repository.save(task);
        return task;
    }
}
