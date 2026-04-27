# NestJS Task Management API

A RESTful task management API built with NestJS, featuring JWT authentication, role-based task ownership, and PostgreSQL persistence via TypeORM.

## Features

- User registration and login with JWT
- Create, read, update, and delete tasks
- Filter tasks by status and search term
- Tasks are scoped to the authenticated user
- Input validation with class-validator
- Environment-based configuration

## Tech Stack

- [NestJS](https://nestjs.com/) — Node.js framework
- TypeScript
- PostgreSQL — relational database
- TypeORM — ORM
- Passport + JWT — authentication
- class-validator / class-transformer — DTO validation
- bcrypt — password hashing

## Prerequisites

- [Node.js](https://nodejs.org/) v14+
- [PostgreSQL](https://www.postgresql.org/) running locally

## Getting Started

### 1. Install dependencies

```bash
git clone https://github.com/ahasan09/nestjs-task-management
cd nestjs-task-management
npm install
```

### 2. Configure the database

Create a `.env` file (or use `config/` files) with your Postgres connection:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=task_management
JWT_SECRET=your_jwt_secret
```

### 3. Run the app

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build && npm run start:prod
```

The API will be available at [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/signin` | Login and receive JWT | No |
| GET | `/tasks` | Get all tasks for current user | Yes |
| POST | `/tasks` | Create a task | Yes |
| GET | `/tasks/:id` | Get a task by ID | Yes |
| PATCH | `/tasks/:id/status` | Update task status | Yes |
| DELETE | `/tasks/:id` | Delete a task | Yes |

### Task Status Values

`OPEN` | `IN_PROGRESS` | `DONE`

### Authentication

Pass the JWT in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Run compiled output |
| `npm run test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |

## Project Structure

```
src/
├── auth/          # JWT auth — signup, signin, strategy
├── tasks/         # Task CRUD — controller, service, entity
├── config.schema.ts  # Env variable validation schema
└── main.ts        # App bootstrap
```
