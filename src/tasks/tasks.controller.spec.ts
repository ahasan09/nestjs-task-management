import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

const mockTasksService: any = {
    getTasks: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
};

const mockUser = {
    id: 'user-id',
    username: 'testuser',
    password: 'hashed',
    tasks: [],
} as User;

const mockTask = {
    id: 'task-id',
    title: 'Test task',
    description: 'Test description',
    status: TaskStatus.OPEN,
    user: mockUser,
} as Task;

describe('TasksController', () => {
    let controller: TasksController;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
            controllers: [TasksController],
            providers: [{ provide: TasksService, useValue: mockTasksService }],
        }).compile();
        module.useLogger(false);

        controller = module.get(TasksController);
    });

    describe('getTasks', () => {
        it('delegates to TasksService.getTasks with filters and user', async () => {
            const filterDto = { status: TaskStatus.OPEN, search: 'foo' };
            mockTasksService.getTasks.mockResolvedValue([mockTask]);

            const result = await controller.getTasks(filterDto, mockUser);

            expect(result).toEqual([mockTask]);
            expect(mockTasksService.getTasks).toHaveBeenCalledWith(filterDto, mockUser);
        });
    });

    describe('getTaskById', () => {
        it('delegates to TasksService.getTaskById', async () => {
            mockTasksService.getTaskById.mockResolvedValue(mockTask);

            const result = await controller.getTaskById('task-id', mockUser);

            expect(result).toEqual(mockTask);
            expect(mockTasksService.getTaskById).toHaveBeenCalledWith('task-id', mockUser);
        });
    });

    describe('createTask', () => {
        it('delegates to TasksService.createTask', async () => {
            const createTaskDto = { title: 'Test task', description: 'Test description' };
            mockTasksService.createTask.mockResolvedValue(mockTask);

            const result = await controller.createTask(createTaskDto, mockUser);

            expect(result).toEqual(mockTask);
            expect(mockTasksService.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
        });
    });

    describe('deleteTask', () => {
        it('delegates to TasksService.deleteTask', async () => {
            mockTasksService.deleteTask.mockResolvedValue(undefined);

            await expect(controller.deleteTask('task-id', mockUser)).resolves.toBeUndefined();
            expect(mockTasksService.deleteTask).toHaveBeenCalledWith('task-id', mockUser);
        });
    });

    describe('updateTask', () => {
        it('extracts status from the dto and delegates to TasksService.updateTask', async () => {
            const updatedTask = { ...mockTask, status: TaskStatus.DONE };
            mockTasksService.updateTask.mockResolvedValue(updatedTask);

            const result = await controller.updateTask(
                'task-id',
                { status: TaskStatus.DONE },
                mockUser,
            );

            expect(result).toEqual(updatedTask);
            expect(mockTasksService.updateTask).toHaveBeenCalledWith(
                'task-id',
                TaskStatus.DONE,
                mockUser,
            );
        });
    });
});
