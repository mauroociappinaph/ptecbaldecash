---
inclusion: always
---

# User Management System Requirements

## Core Features

### Authentication

- Simple login page with email and password fields
- Secure authentication using Laravel Sanctum
- Session management with proper logout functionality

### User Management Interface

- User listing table with columns: ID, First Name, Last Name, Email, Role, Registration Date
- Modal-based forms for create/edit operations
- Confirmation dialogs for delete operations
- Responsive design using Tailwind CSS

### User CRUD Operations

- **Create User**: Modal form with fields for first name, last name, email, password, and role selector (Administrator/Reviewer)
- **Edit User**: Modal form pre-populated with existing user data, same fields as create
- **Delete User**: Soft delete with confirmation dialog
- **View Users**: Paginated table with search and filter capabilities

## Role-Based Access Control

### Administrator Role

- Full access to all CRUD operations
- Can create, edit, and delete users
- Access to all system features

### Reviewer Role

- Read-only access to user listings
- Cannot perform create, edit, or delete operations
- UI should hide/disable action buttons for reviewers

## Technical Requirements

### Backend (Laravel)

- Use Laravel migrations for database schema
- Implement factories for user model testing
- Create seeders to generate 100 random user records
- Implement soft deletes for user records
- Add comprehensive backend validation
- Use middleware for route protection and role-based access
- Send email notifications with credentials for new users
- Write PHPUnit tests for all endpoints

### Frontend (Nuxt.js)

- Implement frontend security measures
- Use middleware for route protection
- Validate user roles before showing UI elements
- Handle API responses and error states properly
- Implement loading states for better UX

### Database Schema

- Users table with soft deletes enabled
- Required fields: first_name, last_name, email, password, role, created_at, updated_at, deleted_at
- Role enum: 'administrator', 'reviewer'
- Proper indexing on email and role columns

### Email Integration

- Configure Laravel Mail for credential notifications
- Use a free email service for development (Mailtrap, MailHog)
- Send welcome emails with login credentials to new users

## Code Standards

### Naming Conventions

- Laravel: PascalCase for classes, snake_case for database columns
- Vue Components: PascalCase (UserModal.vue, UserList.vue)
- API endpoints: RESTful naming (/api/users, /api/auth/login)

### Security Practices

- Input validation on both frontend and backend
- CSRF protection enabled
- Rate limiting on authentication endpoints
- Proper error handling without exposing sensitive information
- Environment variables for all configuration

### Testing Requirements

- Unit tests for all models and services
- Feature tests for API endpoints
- Component tests for Vue components
- Test coverage for role-based access control

## Development Workflow

1. Backend API development first (models, controllers, routes)
2. Database migrations and seeders
3. Frontend component development
4. Authentication and authorization implementation
5. Email notification setup
6. Testing and validation
7. Documentation updates
