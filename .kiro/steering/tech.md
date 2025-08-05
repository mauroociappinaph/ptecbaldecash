# Technology Stack

## Backend - Laravel

- **Framework**: Laravel 10+ with PHP 8.1+
- **Database**: MySQL with migrations and seeders
- **Authentication**: Laravel Sanctum for API token authentication
- **Email**: Laravel Mail for credential notifications
- **Testing**: PHPUnit for unit and feature tests
- **Architecture**: RESTful API with proper middleware stack

## Frontend - Nuxt.js

- **Framework**: Nuxt 3 with Vue 3 and TypeScript
- **State Management**: Pinia for application state
- **Authentication**: Nuxt Auth Utils for session management
- **Styling**: Tailwind CSS for responsive design
- **Testing**: Vitest for component and integration tests

## Database Schema

- Users table with soft deletes
- Personal access tokens (Laravel Sanctum)
- Proper indexing on email, role, and deleted_at columns

## Common Commands

### Backend (Laravel)

```bash
# Install dependencies
composer install

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed

# Run tests
php artisan test

# Start development server
php artisan serve
```

### Frontend (Nuxt.js)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Development Environment

- Environment variables configured via .env files
- CORS configured for API access
- Rate limiting on authentication endpoints
- Comprehensive error handling and logging
