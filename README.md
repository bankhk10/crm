# CRM Project

## Environment Setup
1. Clone repository and navigate to project root.
2. Create an `.env` file with database credentials and JWT secrets:

```env
DB_ROOT_PASSWORD=your_strong_root_password
DB_NAME=crm_db
DB_USER=crm_user
DB_PASSWORD=your_strong_db_password

JWT_SECRET=your-super-secret-key-for-jwt
JWT_REFRESH_SECRET=your-super-secret-key-for-refresh-token
```

## Running the Project
### Development
Hot reloading for both frontend and backend.

```bash

docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml up --build -d

```

### Production
Runs optimized builds suitable for deployment.

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

### Stopping Containers
Press `Ctrl + C` and run:

```bash
docker-compose down
```

## Default Login
- **Email:** `admin@example.com`
- **Password:** `password123`

## Project Structure
```
project-root/
├─ backend/
│  ├─ prisma/
│  ├─ src/
│  ├─ Dockerfile
│  └─ Dockerfile.dev
├─ frontend/
│  ├─ app/
│  ├─ components/
│  ├─ context/
│  ├─ lib/
│  ├─ public/
│  ├─ Dockerfile
│  └─ Dockerfile.dev
├─ ops/
│  └─ nginx/
├─ docker-compose.dev.yml
├─ docker-compose.prod.yml
├─ .env.production.example
├─ .gitignore
├─ .nvmrc
└─ README.md
```

## Database Seeding
Run inside the backend container:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```
