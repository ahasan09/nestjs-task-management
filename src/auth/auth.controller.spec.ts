import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService: any = {
    signUp: jest.fn(),
    signIn: jest.fn(),
};

const credentials = { username: 'testuser', password: 'Secret123!' };

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile();

        controller = module.get(AuthController);
    });

    describe('signUp', () => {
        it('delegates to AuthService.signUp', async () => {
            mockAuthService.signUp.mockResolvedValue(undefined);

            await expect(controller.signUp(credentials)).resolves.toBeUndefined();
            expect(mockAuthService.signUp).toHaveBeenCalledWith(credentials);
        });
    });

    describe('signIn', () => {
        it('delegates to AuthService.signIn and returns the accessToken', async () => {
            mockAuthService.signIn.mockResolvedValue({ accessToken: 'jwt-token' });

            const result = await controller.signIn(credentials);

            expect(result).toEqual({ accessToken: 'jwt-token' });
            expect(mockAuthService.signIn).toHaveBeenCalledWith(credentials);
        });
    });
});
