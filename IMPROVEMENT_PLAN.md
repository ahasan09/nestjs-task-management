# Improvement Plan: nestjs-task-management

## Overview
Modern NestJS 9 + TypeORM + PostgreSQL + JWT REST API. Good foundation. Improvements focus on production-readiness: containerization, documentation, security hardening, and test coverage.

## Improvements

### Testing
- Add Jest unit tests for each service method (TasksService, AuthService) using mocked repositories
- Add e2e tests using NestJS's `@nestjs/testing` + `supertest` for all API endpoints
- Add test coverage reporting and set a minimum threshold (≥80%)
- Add a separate test database config using PostgreSQL test containers or SQLite for CI

### API Documentation
- Add `@nestjs/swagger` (Swagger/OpenAPI) decorators to all controllers and DTOs
- Expose Swagger UI at `/api/docs`

### Security
- Add rate limiting (`@nestjs/throttler`) to auth endpoints to prevent brute-force attacks
- Add request logging middleware (e.g., `nestjs-pino` or `@nestjs/common` logger)
- Validate JWT expiry and add refresh token support
- Add CORS configuration
- Rotate JWT secret out of `.env.stage.dev` and into a secrets manager for production

### DevOps
- Add a `Dockerfile` (multi-stage: build + runtime)
- Add a `docker-compose.yml` for local development (app + PostgreSQL)
- Add GitHub Actions CI: lint + test + build Docker image on every PR

### Code Quality
- Enable TypeScript `strict` mode
- Add class-validator constraints to all DTOs (not just `@IsNotEmpty`)
- Add `@nestjs/config` for centralized environment variable management with validation
