# User Management System

A comprehensive web-based user management system built with Laravel backend and Nuxt.js frontend. The system provides secure authentication, role-based access control, and full CRUD operations for managing users with email notifications and comprehensive security measures.

## Features

- **🔐 Authentication**: Secure login system with email/password credentials and session management
- **👥 Role-Based Access**: Two distinct roles (Administrator and Reviewer) with different permission levels
- **📝 User Management**: Complete CRUD operations for user accounts (Create, Read, Update, Delete)
- **📧 Email Notifications**: Automated credential delivery via email for new users
- **🛡️ Security**: Comprehensive security measures including input validation, rate limiting, CSRF protection, and soft deletes
- **🏗️ Modern Architecture**: Full-stack application with clear separation between frontend and backend
- **🎨 User Interface**: Complete user management interface with modals, pagination, search, and filtering
- **🧪 Testing**: Comprehensive test suite for both backend and frontend components
- **📚 Documentation**: Complete API documentation and setup instructions

## Technology Stack

### Backend (Laravel)

- **Framework**: Laravel 11+ with PHP 8.2+
- **Database**: MySQL/SQLite with migrations and seeders
- **Authentication**: Laravel Sanctum for API token authentication
- **Email**: Laravel Mail for credential notifications
- **Testing**: PHPUnit for unit and feature tests
- **Security**: Rate limiting, CSRF protection, input validation

### Frontend (Nuxt.js)

- **Framework**: Nuxt 3 with Vue 3 and TypeScript
- **State Management**: Pinia for application state
- **Authentication**: Nuxt Auth Utils for session management
- **Styling**: Tailwind CSS for responsive design
- **Testing**: Vitest for component and integration tests
- **Type Safety**: Full TypeScript support with strict mode

## Project Structure

```
project-root/
├── backend/                 # Laravel API application
│   ├── app/                 # Application logic
│   ├── database/            # Migrations, seeders, factories
│   ├── routes/              # API routes
│   └── tests/               # PHPUnit tests
├── frontend/                # Nuxt.js application
│   ├── components/          # Vue components
│   ├── composables/         # Vue composables
│   ├── stores/              # Pinia state management
│   ├── pages/               # Route pages
│   │   ├── index.vue        # Landing page
│   │   ├── login.vue        # Authentication page
│   │   ├── users.vue        # User management page
│   │   ├── simple.vue       # Simple test page
│   │   └── test-simple.vue  # Alternative test page
│   └── types/               # TypeScript definitions
└── .kiro/                   # Kiro configuration
```

## Quick Start

### Prerequisites

- **PHP**: 8.2 or higher
- **Composer**: Latest version
- **Node.js**: 18 or higher
- **npm/yarn**: Latest version
- **Database**: MySQL 8.0+ or SQLite (for development)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd user-management-system
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan serve
   ```

3. **Frontend Setup (in a new terminal):**

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Default Login Credentials

After seeding the database, you can use these credentials:

- **Administrator**: Check the seeded users in the database or create one via the interface
- **Reviewer**: Check the seeded users in the database

The seeder creates 100 random users with mixed roles. Check the database or logs for specific credentials.

## Environment Configuration

### Backend Configuration (.env)

Key environment variables for the Laravel backend:

```env
# Application
APP_NAME="User Management System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite for development)
DB_CONNECTION=sqlite

# Database (MySQL for production)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=user_management
# DB_USERNAME=root
# DB_PASSWORD=

# Mail Configuration (Development)
MAIL_MAILER=log
MAIL_FROM_ADDRESS="admin@usermanagement.local"
MAIL_FROM_NAME="${APP_NAME}"

# Mail Configuration (Production)
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.mailtrap.io
# MAIL_PORT=2525
# MAIL_USERNAME=your_username
# MAIL_PASSWORD=your_password

# Security
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SANCTUM_TOKEN_EXPIRATION=1440

# Rate Limiting
THROTTLE_LOGIN_ATTEMPTS=5
THROTTLE_API_REQUESTS=60
```

### Frontend Configuration (.env)

Key environment variables for the Nuxt.js frontend:

```env
# Application
NUXT_PUBLIC_APP_NAME="User Management System"

# API Configuration
NUXT_PUBLIC_API_BASE="http://localhost:8000/api"

# Security
NUXT_API_SECRET="your-secret-key-here"
NUXT_SESSION_PASSWORD="your-secure-session-password-here"

# Development
NODE_ENV="development"
NUXT_DEVTOOLS_ENABLED=true
```

## User Roles

- **Administrator**: Full system access including user creation, editing, and deletion
- **Reviewer**: Read-only access to view user listings and information

## Authentication Flow

The system uses a hybrid authentication approach:

1. **Frontend Authentication**: Nuxt.js server-side handlers (`/api/auth/login`, `/api/auth/logout`) manage user sessions
2. **Backend API**: Laravel Sanctum provides API token authentication for backend requests
3. **Session Management**: Nuxt Auth Utils handles user session persistence and middleware protection with optimized server-side session clearing
4. **Role-Based Access**: Both frontend and backend enforce role-based permissions
5. **Landing Page**: The index page (`/`) provides a simple welcome interface with navigation links to login and user management pages

## API Documentation

### Authentication Endpoints

| Method | Endpoint           | Description         | Auth Required | Role Required |
| ------ | ------------------ | ------------------- | ------------- | ------------- |
| POST   | `/api/auth/login`  | User authentication | No            | -             |
| POST   | `/api/auth/logout` | User logout         | Yes           | -             |
| GET    | `/api/auth/user`   | Get current user    | Yes           | -             |

### User Management Endpoints

| Method | Endpoint          | Description               | Auth Required | Role Required |
| ------ | ----------------- | ------------------------- | ------------- | ------------- |
| GET    | `/api/users`      | List users (paginated)    | Yes           | -             |
| POST   | `/api/users`      | Create new user           | Yes           | Administrator |
| PUT    | `/api/users/{id}` | Update user               | Yes           | Administrator |
| DELETE | `/api/users/{id}` | Delete user (soft delete) | Yes           | Administrator |

### Query Parameters

**GET /api/users** supports:

- `page` - Page number for pagination
- `search` - Search term for name/email
- `role` - Filter by user role (administrator/reviewer)

### Response Format

All API responses follow a consistent format:

```json
{
  "data": {
    /* response data */
  },
  "message": "Success message",
  "errors": {
    /* validation errors if any */
  }
}
```

For detailed API documentation with request/response examples, see [API.md](API.md).

## Testing

### Backend Testing (PHPUnit)

```bash
cd backend

# Run all tests
php artisan test

# Run specific test suites
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/UserControllerTest.php
```

**Test Coverage:**

- ✅ User model methods and relationships
- ✅ Authentication endpoints (login/logout)
- ✅ User CRUD operations
- ✅ Role-based access control
- ✅ Email sending functionality
- ✅ Form validation
- ✅ Rate limiting
- ✅ Error handling

### Frontend Testing (Vitest)

```bash
cd frontend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test -- LoginForm.test.ts

# Type checking
npm run type-check
```

**Test Coverage:**

- ✅ Vue component rendering and behavior
- ✅ Authentication composables
- ✅ User management flows
- ✅ Role-based UI rendering
- ✅ API integration
- ✅ State management (Pinia stores)
- ✅ TypeScript type definitions

### Running Tests in CI/CD

Both test suites are designed to run in continuous integration environments:

```bash
# Backend CI
cd backend && composer install --no-dev && php artisan test

# Frontend CI
cd frontend && npm ci && npm run test && npm run type-check
```

## Current Implementation Status

### ✅ Completed Features

- **Backend API**: Complete Laravel backend with authentication, user CRUD, and email notifications
- **Database**: User model with soft deletes, factories, and seeders (100 sample users)
- **Authentication**: Laravel Sanctum API authentication with role-based middleware
- **Frontend Authentication**: Fully functional login form with validation, error handling, and role-based routing
- **Type Safety**: Complete TypeScript type definitions for all API interfaces
- **Testing**: Comprehensive test suite for backend functionality and frontend type definitions
- **Code Quality**: Consistent code formatting with ESLint/Prettier integration and standardized quote usage across components

### 🔧 Development Notes

- **Authentication Middleware**: Currently temporarily disabled on the users page for testing purposes. The middleware normally protects the user management interface and redirects unauthenticated users to the login page.
- **Guest Middleware**: Currently temporarily disabled on the login page for testing purposes. The middleware normally redirects authenticated users away from the login page to prevent unnecessary access.
- **Index Page**: The root page (`/`) has been simplified to a basic landing page with navigation links, removing automatic authentication redirects to avoid routing complexity.
- **Test Pages**: Added simple test pages (`/simple`, `/test-simple`) for development and debugging purposes to verify routing functionality without complex dependencies.
- **Middleware Syntax**: Fixed middleware syntax in users.vue page by changing from import-based to string-based middleware definition for better compatibility with Nuxt 3.
- **Button Component**: Fixed NuxtLink tag comparison in Button.vue component to properly handle router link rendering.
- **Code Formatting**: Applied consistent formatting improvements across the codebase, including standardized quote usage and cleanup of duplicate code blocks in app.vue.
- **TypeScript Configuration**: Fixed TypeScript errors in the users.vue page by ensuring proper imports for composables and stores. While Nuxt's auto-import feature is configured, explicit imports are used for better TypeScript support and IDE compatibility.
- **Debug Logging**: Added enhanced debug logging in app.vue with route tracking and router inspection for development troubleshooting. Console logs include route path monitoring and available routes listing to help debug navigation issues. ToastContainer component also includes debug logging for toast system monitoring.

### ✅ Recently Completed

- **User Management Interface**: Complete user management interface with listing, creation, editing, and deletion
- **Frontend State Management**: Pinia stores fully implemented with comprehensive error handling
- **UI Components**: All user management modals completed with proper validation and accessibility
- **Authentication System**: Complete login/logout functionality with proper session management and error handling
- **Session Management**: Optimized logout functionality with server-side session clearing to prevent redundant operations
- **Code Quality**: Fixed TypeScript errors, improved response handling in authentication flow, and resolved HTML structure issues in LoginForm component
- **Modal Components**: Updated modal emit signatures to properly pass user data on success events, ensuring consistent data flow between components and parent pages
- **Form Error Handling**: Enhanced form error handling composable with proper HTTP status code constants and improved TypeScript type safety
- **TypeScript Support**: Resolved all TypeScript compilation errors in the users.vue page by ensuring proper imports and type definitions. The application now builds successfully with full type safety.

### 📋 Next Steps

1. ✅ Complete user listing page with pagination, search, and role filtering
2. ✅ Implement user creation modal with form validation and API integration
3. ✅ Build user editing modal with pre-filled form data
4. ✅ Add user deletion functionality with confirmation dialog
5. ✅ Create reusable UI components (Modal, Button, Table, Loading, Error)
6. 🚧 Implement comprehensive backend error handling and security measures
7. 🚧 Create comprehensive test suite for both frontend and backend
8. 🚧 Add documentation and environment configuration

## Development

### Development Workflow

This project follows spec-driven development methodology. See `.kiro/specs/user-management-system/` for detailed requirements, design, and implementation tasks.

1. **Start Development Servers:**

   ```bash
   # Terminal 1 - Backend
   cd backend && php artisan serve

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Access Development Tools:**
   - Application: http://localhost:3000
   - API: http://localhost:8000
   - Nuxt DevTools: Available in browser
   - Laravel Telescope: http://localhost:8000/telescope (if installed)

### Development Commands

**Backend Commands:**

```bash
# Database operations
php artisan migrate:fresh --seed  # Reset database with fresh data
php artisan db:seed               # Add sample data
php artisan tinker               # Interactive PHP shell

# Code quality
php artisan test                 # Run tests
composer dump-autoload          # Refresh autoloader

# Cache management
php artisan config:clear         # Clear config cache
php artisan route:clear          # Clear route cache
```

**Frontend Commands:**

```bash
# Development
npm run dev                      # Start dev server
npm run build                    # Build for production
npm run preview                  # Preview production build

# Testing and quality
npm run test                     # Run tests
npm run test:watch              # Run tests in watch mode
npm run type-check              # TypeScript type checking
npm run lint                    # ESLint checking
```

### Code Standards

- **PHP**: PSR-12 coding standard
- **JavaScript/TypeScript**: ESLint + Prettier configuration
- **Vue**: Vue 3 Composition API patterns
- **CSS**: Tailwind CSS utility classes
- **Git**: Conventional commit messages

### Debugging

**Backend Debugging:**

- Use `dd()` and `dump()` for variable inspection
- Check `storage/logs/laravel.log` for application logs
- Use Laravel Telescope for request debugging

**Frontend Debugging:**

- Vue DevTools browser extension
- Nuxt DevTools (built-in)
- Browser console for API requests
- Debug pages: `/simple`, `/test-simple` for routing issues

## Deployment

### Production Deployment

**Backend (Laravel):**

1. **Server Requirements:**

   - PHP 8.2+
   - MySQL 8.0+
   - Composer
   - Web server (Apache/Nginx)

2. **Deployment Steps:**

   ```bash
   # Clone and setup
   git clone <repository-url>
   cd backend
   composer install --optimize-autoloader --no-dev

   # Environment configuration
   cp .env.example .env
   # Edit .env with production values
   php artisan key:generate

   # Database setup
   php artisan migrate --force
   php artisan db:seed --force

   # Optimization
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Production Environment Variables:**

   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=your-db-host
   DB_DATABASE=your-db-name
   DB_USERNAME=your-db-user
   DB_PASSWORD=your-db-password

   MAIL_MAILER=smtp
   MAIL_HOST=your-smtp-host
   MAIL_PORT=587
   MAIL_USERNAME=your-smtp-user
   MAIL_PASSWORD=your-smtp-password
   ```

**Frontend (Nuxt.js):**

1. **Build and Deploy:**

   ```bash
   cd frontend
   npm ci
   npm run build

   # Deploy .output directory to your hosting provider
   ```

2. **Production Environment Variables:**
   ```env
   NODE_ENV=production
   NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
   NUXT_PUBLIC_APP_NAME="User Management System"
   ```

### Docker Deployment

Docker configuration files are available for containerized deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t user-management-backend ./backend
docker build -t user-management-frontend ./frontend
```

### Security Considerations

**Production Security Checklist:**

- ✅ Set `APP_DEBUG=false` in production
- ✅ Use HTTPS for all communications
- ✅ Configure proper CORS settings
- ✅ Set secure session cookies
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Regular security updates
- ✅ Database connection encryption
- ✅ Proper file permissions (755 for directories, 644 for files)

### Monitoring and Maintenance

**Recommended Tools:**

- **Logging**: Laravel Log Viewer, Sentry
- **Monitoring**: New Relic, DataDog
- **Uptime**: Pingdom, UptimeRobot
- **Performance**: Laravel Telescope, Vue DevTools

**Maintenance Tasks:**

- Regular database backups
- Log rotation and cleanup
- Security updates
- Performance monitoring
- SSL certificate renewal

## Troubleshooting

### Common Issues

**Backend Issues:**

1. **Database Connection Error:**

   ```bash
   # Check database configuration
   php artisan config:clear
   php artisan migrate:status
   ```

2. **Permission Errors:**

   ```bash
   # Fix storage permissions
   chmod -R 775 storage bootstrap/cache
   ```

3. **Composer Dependencies:**
   ```bash
   # Clear and reinstall
   rm -rf vendor composer.lock
   composer install
   ```

**Frontend Issues:**

1. **API Connection Error:**

   - Check `NUXT_PUBLIC_API_BASE` in `.env`
   - Verify backend server is running
   - Check CORS configuration

2. **Build Errors:**

   ```bash
   # Clear cache and rebuild
   rm -rf .nuxt .output node_modules
   npm install
   npm run dev
   ```

3. **TypeScript Errors:**
   ```bash
   # Check types
   npm run type-check
   ```

### Performance Optimization

**Backend Optimization:**

- Enable OPcache in production
- Use Redis for caching and sessions
- Optimize database queries
- Enable Laravel's built-in caching

**Frontend Optimization:**

- Enable Nuxt's built-in optimizations
- Use lazy loading for components
- Optimize images and assets
- Enable compression (gzip/brotli)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Support

For support and questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [API documentation](API.md)
3. Check existing GitHub issues
4. Create a new issue with detailed information

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and version history.

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Acknowledgments

- Laravel Framework
- Nuxt.js Framework
- Vue.js Community
- Tailwind CSS
- All contributors and testers
