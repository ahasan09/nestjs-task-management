import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import {
    ConflictException,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './user.entity';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt as any;

const mockRepository: any = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
};

const mockJwtService: any = {
    sign: jest.fn(),
};

const credentials = { username: 'testuser', password: 'Secret123!' };

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(User), useValue: mockRepository },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    describe('signUp', () => {
        it('hashes the password and saves the new user', async () => {
            mockedBcrypt.genSalt.mockResolvedValue('salt');
            mockedBcrypt.hash.mockResolvedValue('hashed-password');
            const user = { username: 'testuser', password: 'hashed-password' };
            mockRepository.create.mockReturnValue(user);
            mockRepository.save.mockResolvedValue(user);

            await expect(service.signUp(credentials)).resolves.toBeUndefined();

            expect(mockedBcrypt.hash).toHaveBeenCalledWith('Secret123!', 'salt');
            expect(mockRepository.create).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'hashed-password',
            });
            expect(mockRepository.save).toHaveBeenCalledWith(user);
        });

        it('throws ConflictException when the username already exists', async () => {
            mockedBcrypt.genSalt.mockResolvedValue('salt');
            mockedBcrypt.hash.mockResolvedValue('hashed-password');
            mockRepository.create.mockReturnValue({});
            mockRepository.save.mockRejectedValue({ code: '23505' });

            await expect(service.signUp(credentials)).rejects.toThrow(
                new ConflictException('Username already exists'),
            );
        });

        it('throws InternalServerErrorException on any other save error', async () => {
            mockedBcrypt.genSalt.mockResolvedValue('salt');
            mockedBcrypt.hash.mockResolvedValue('hashed-password');
            mockRepository.create.mockReturnValue({});
            mockRepository.save.mockRejectedValue({ code: '42000' });

            await expect(service.signUp(credentials)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('signIn', () => {
        it('returns an accessToken for valid credentials', async () => {
            mockRepository.findOneBy.mockResolvedValue({
                username: 'testuser',
                password: 'hashed-password',
            });
            mockedBcrypt.compare.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.signIn(credentials);

            expect(result).toEqual({ accessToken: 'jwt-token' });
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                username: 'testuser',
            });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(
                'Secret123!',
                'hashed-password',
            );
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                username: 'testuser',
            });
        });

        it('throws UnauthorizedException when the user does not exist', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.signIn(credentials)).rejects.toThrow(
                new UnauthorizedException('Please check your login credentials'),
            );
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('throws UnauthorizedException when the password is wrong', async () => {
            mockRepository.findOneBy.mockResolvedValue({
                username: 'testuser',
                password: 'hashed-password',
            });
            mockedBcrypt.compare.mockResolvedValue(false);

            await expect(service.signIn(credentials)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });
    });
});
