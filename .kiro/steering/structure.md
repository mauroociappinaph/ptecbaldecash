# Project Structure

## Repository Organization

This is a full-stack application with separate backend and frontend projects that will be organized as follows:

```
project-root/
├── backend/                 # Laravel API application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/ # API controllers (Auth, User)
│   │   │   ├── Middleware/  # Role-based access control
│   │   │   └── Requests/    # Form validation classes
│   │   ├── Models/          # Eloquent models (User)
│   │   ├── Mail/            # Email notification classes
│   │   └── Exceptions/      # Custom exception handling
│   ├── database/
│   │   ├── migrations/      # Database schema migrations
│   │   ├── seeders/         # Sample data generation
│   │   └── factories/       # Model factories for testing
│   ├── routes/
│   │   └── api.php          # API route definitions
│   └── tests/               # PHPUnit tests
├── frontend/                # Nuxt.js application
│   ├── components/
│   │   ├── Auth/            # Login components
│   │   ├── Users/           # User management components
│   │   ├── UI/              # Reusable UI components
│   │   └── Layout/          # Layout components
│   ├── composables/         # Vue composables (useAuth)
│   ├── stores/              # Pinia state management
│   ├── pages/               # Route pages
│   ├── middleware/          # Authentication middleware
│   ├── types/               # TypeScript type definitions
│   └── tests/               # Vitest component tests
└── .kiro/                   # Kiro configuration
    ├── specs/               # Project specifications
    └── steering/            # AI assistant guidance
```

## Key Architectural Patterns

- **Separation of Concerns**: Clear separation between API backend and frontend client
- **RESTful API Design**: Standard HTTP methods and status codes
- **Component-Based Frontend**: Reusable Vue components with proper composition
- **Role-Based Access Control**: Middleware-enforced permissions on both frontend and backend
- **Soft Deletes**: Data preservation with logical deletion flags
- **Factory Pattern**: Database seeders and factories for consistent test data

## File Naming Conventions

- **Laravel**: PascalCase for classes, snake_case for files and database columns
- **Vue Components**: PascalCase for component files (UserList.vue)
- **TypeScript**: camelCase for variables/functions, PascalCase for interfaces
- **API Routes**: kebab-case for endpoints (/api/users, /api/auth/login)

## Development Workflow

1. Backend API development first (models, controllers, routes)
2. Frontend component development with API integration
3. Authentication and authorization implementation
4. Testing and validation
5. Documentation and deployment preparation
