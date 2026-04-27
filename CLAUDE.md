# NestJS Task Management

NestJS 9 REST API for task management with JWT authentication, TypeORM, and PostgreSQL.

## Tech Stack
- NestJS 9
- TypeScript
- TypeORM
- PostgreSQL
- JWT (authentication)
- class-validator / class-transformer

## Project Structure
```
nestjs-task-management/
├── src/
│   ├── auth/            # JWT auth module
│   ├── tasks/           # Tasks CRUD module
│   └── main.ts
├── .env.stage.dev       # Environment variables (DB credentials)
└── package.json
```

## Development
```bash
# Install dependencies
npm install

# Run development server (with watch)
npm run start:dev

# Build
npm run build
```

## Key Notes
- Requires PostgreSQL running on `localhost:5432`. Configure DB credentials in `.env.stage.dev`.
- JWT secret and expiry are also configured in `.env.stage.dev`.
