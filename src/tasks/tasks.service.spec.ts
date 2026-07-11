import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
};

const mockRepository: any = {
    createQueryBuilder: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
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

describe('TasksService', () => {
    let service: TasksService;

    beforeEach(async () => {
        jest.clearAllMocks();
        mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockQueryBuilder.where.mockReturnThis();
        mockQueryBuilder.andWhere.mockReturnThis();

        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: getRepositoryToken(Task), useValue: mockRepository },
            ],
        }).compile();
        module.useLogger(false);

        service = module.get(TasksService);
    });

    describe('getTasks', () => {
        it('returns all tasks for the user when no filters are given', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([mockTask]);

            const result = await service.getTasks({}, mockUser);

            expect(result).toEqual([mockTask]);
            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('task');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user: mockUser });
            expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
        });

        it('applies status and search filters', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            await service.getTasks(
                { status: TaskStatus.IN_PROGRESS, search: 'foo' },
                mockUser,
            );

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'status = :status',
                { status: TaskStatus.IN_PROGRESS },
            );
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(LOWER(title) LIKE LOWER(:search) OR LOWER(description) LIKE LOWER(:search))',
                { search: '%foo%' },
            );
        });

        it('throws InternalServerErrorException when the query fails', async () => {
            mockQueryBuilder.getMany.mockRejectedValue(new Error('db down'));

            await expect(service.getTasks({}, mockUser)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('getTaskById', () => {
        it('returns the task when found', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockTask);

            const result = await service.getTaskById('task-id', mockUser);

            expect(result).toEqual(mockTask);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                id: 'task-id',
                user: mockUser,
            });
        });

        it('throws NotFoundException when the task does not exist', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.getTaskById('missing-id', mockUser)).rejects.toThrow(
                new NotFoundException('Task with ID "missing-id" not found'),
            );
        });
    });

    describe('createTask', () => {
        it('creates and saves a new OPEN task for the user', async () => {
            mockRepository.create.mockReturnValue(mockTask);
            mockRepository.save.mockResolvedValue(mockTask);

            const result = await service.createTask(
                { title: 'Test task', description: 'Test description' },
                mockUser,
            );

            expect(mockRepository.create).toHaveBeenCalledWith({
                title: 'Test task',
                description: 'Test description',
                status: TaskStatus.OPEN,
                user: mockUser,
            });
            expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
            expect(result).toEqual(mockTask);
        });
    });

    describe('deleteTask', () => {
        it('deletes the task when it exists', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 });

            await expect(service.deleteTask('task-id', mockUser)).resolves.toBeUndefined();
            expect(mockRepository.delete).toHaveBeenCalledWith({
                id: 'task-id',
                user: mockUser,
            });
        });

        it('throws NotFoundException when nothing was deleted', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 });

            await expect(service.deleteTask('missing-id', mockUser)).rejects.toThrow(
                new NotFoundException('Task with ID "missing-id" not found'),
            );
        });
    });

    describe('updateTask', () => {
        it('updates the status of an existing task', async () => {
            mockRepository.findOneBy.mockResolvedValue({ ...mockTask });
            mockRepository.save.mockImplementation((task) => Promise.resolve(task));

            const result = await service.updateTask(
                'task-id',
                TaskStatus.DONE,
                mockUser,
            );

            expect(result.status).toEqual(TaskStatus.DONE);
            expect(mockRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'task-id', status: TaskStatus.DONE }),
            );
        });

        it('throws NotFoundException when the task does not exist', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.updateTask('missing-id', TaskStatus.DONE, mockUser),
            ).rejects.toThrow(NotFoundException);
            expect(mockRepository.save).not.toHaveBeenCalled();
        });
    });
});
