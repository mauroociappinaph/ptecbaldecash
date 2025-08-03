# Environment Variables Documentation

This document provides comprehensive documentation for all environment variables used in the User Management System.

## Table of Contents

- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Environment-Specific Configurations](#environment-specific-configurations)
- [Security Considerations](#security-considerations)
- [Docker Configuration](#docker-configuration)

## Backend Environment Variables

### Application Configuration

| Variable    | Type    | Default                  | Description                                                           | Required |
| ----------- | ------- | ------------------------ | --------------------------------------------------------------------- | -------- |
| `APP_NAME`  | string  | "User Management System" | Application name displayed in emails and UI                           | Yes      |
| `APP_ENV`   | string  | local                    | Environment (local, staging, production)                              | Yes      |
| `APP_KEY`   | string  | -                        | Application encryption key (generate with `php artisan key:generate`) | Yes      |
| `APP_DEBUG` | boolean | true                     | Enable debug mode (set to false in production)                        | Yes      |
| `APP_URL`   | string  | http://localhost:8000    | Base URL of the backend application                                   | Yes      |

### Database Configuration

| Variable        | Type    | Default   | Description                            | Required                  |
| --------------- | ------- | --------- | -------------------------------------- | ------------------------- |
| `DB_CONNECTION` | string  | sqlite    | Database driver (mysql, pgsql, sqlite) | Yes                       |
| `DB_HOST`       | string  | 127.0.0.1 | Database host                          | If using MySQL/PostgreSQL |
| `DB_PORT`       | integer | 3306      | Database port                          | If using MySQL/PostgreSQL |
| `DB_DATABASE`   | string  | -         | Database name                          | If using MySQL/PostgreSQL |
| `DB_USERNAME`   | string  | -         | Database username                      | If using MySQL/PostgreSQL |
| `DB_PASSWORD`   | string  | -         | Database password                      | If using MySQL/PostgreSQL |

### Mail Configuration

| Variable            | Type    | Default                    | Description                       | Required      |
| ------------------- | ------- | -------------------------- | --------------------------------- | ------------- |
| `MAIL_MAILER`       | string  | log                        | Mail driver (log, smtp, sendmail) | Yes           |
| `MAIL_HOST`         | string  | 127.0.0.1                  | SMTP host                         | If using SMTP |
| `MAIL_PORT`         | integer | 2525                       | SMTP port                         | If using SMTP |
| `MAIL_USERNAME`     | string  | -                          | SMTP username                     | If using SMTP |
| `MAIL_PASSWORD`     | string  | -                          | SMTP password                     | If using SMTP |
| `MAIL_ENCRYPTION`   | string  | tls                        | SMTP encryption (tls, ssl, null)  | If using SMTP |
| `MAIL_FROM_ADDRESS` | string  | admin@usermanagement.local | Default sender email              | Yes           |
| `MAIL_FROM_NAME`    | string  | ${APP_NAME}                | Default sender name               | Yes           |

### Security Configuration

| Variable                   | Type    | Default                       | Description                                 | Required |
| -------------------------- | ------- | ----------------------------- | ------------------------------------------- | -------- |
| `FRONTEND_URL`             | string  | http://localhost:3000         | Frontend application URL                    | Yes      |
| `SANCTUM_STATEFUL_DOMAINS` | string  | localhost:3000,127.0.0.1:3000 | Domains for stateful authentication         | Yes      |
| `SANCTUM_TOKEN_EXPIRATION` | integer | 1440                          | Token expiration in minutes                 | No       |
| `SESSION_SECURE_COOKIE`    | boolean | false                         | Use secure cookies (set to true with HTTPS) | No       |

### Rate Limiting Configuration

| Variable                        | Type    | Default | Description                              | Required |
| ------------------------------- | ------- | ------- | ---------------------------------------- | -------- |
| `THROTTLE_LOGIN_ATTEMPTS`       | integer | 5       | Login attempts per minute per IP         | No       |
| `THROTTLE_API_REQUESTS`         | integer | 60      | API requests per minute per user         | No       |
| `THROTTLE_SENSITIVE_OPERATIONS` | integer | 10      | Sensitive operations per minute per user | No       |
| `THROTTLE_GLOBAL_REQUESTS`      | integer | 100     | Global requests per minute per IP        | No       |

### Cache and Session Configuration

| Variable           | Type    | Default   | Description                            | Required       |
| ------------------ | ------- | --------- | -------------------------------------- | -------------- |
| `CACHE_STORE`      | string  | database  | Cache driver (database, redis, file)   | No             |
| `SESSION_DRIVER`   | string  | database  | Session driver (database, redis, file) | No             |
| `SESSION_LIFETIME` | integer | 120       | Session lifetime in minutes            | No             |
| `REDIS_HOST`       | string  | 127.0.0.1 | Redis host                             | If using Redis |
| `REDIS_PORT`       | integer | 6379      | Redis port                             | If using Redis |
| `REDIS_PASSWORD`   | string  | -         | Redis password                         | If using Redis |

### Logging Configuration

| Variable      | Type   | Default | Description                                                                 | Required |
| ------------- | ------ | ------- | --------------------------------------------------------------------------- | -------- |
| `LOG_CHANNEL` | string | stack   | Log channel (stack, single, daily)                                          | No       |
| `LOG_LEVEL`   | string | debug   | Log level (emergency, alert, critical, error, warning, notice, info, debug) | No       |

## Frontend Environment Variables

### Application Configuration

| Variable                  | Type   | Default                  | Description                                         | Required |
| ------------------------- | ------ | ------------------------ | --------------------------------------------------- | -------- |
| `NUXT_PUBLIC_APP_NAME`    | string | "User Management System" | Application name                                    | Yes      |
| `NUXT_PUBLIC_APP_VERSION` | string | "1.0.0"                  | Application version                                 | No       |
| `NODE_ENV`                | string | development              | Node environment (development, staging, production) | Yes      |

### API Configuration

| Variable                         | Type    | Default                   | Description                                  | Required |
| -------------------------------- | ------- | ------------------------- | -------------------------------------------- | -------- |
| `NUXT_PUBLIC_API_BASE`           | string  | http://localhost:8000/api | Backend API base URL                         | Yes      |
| `NUXT_PUBLIC_API_TIMEOUT`        | integer | 10000                     | API request timeout in milliseconds          | No       |
| `NUXT_PUBLIC_API_RETRY_ATTEMPTS` | integer | 3                         | Number of retry attempts for failed requests | No       |

### Authentication Configuration

| Variable                | Type    | Default                 | Description                                         | Required |
| ----------------------- | ------- | ----------------------- | --------------------------------------------------- | -------- |
| `NUXT_API_SECRET`       | string  | -                       | Server-side API secret (never exposed to client)    | Yes      |
| `NUXT_SESSION_PASSWORD` | string  | -                       | Session encryption password (minimum 32 characters) | Yes      |
| `NUXT_SESSION_NAME`     | string  | user-management-session | Session cookie name                                 | No       |
| `NUXT_SESSION_MAX_AGE`  | integer | 86400                   | Session max age in seconds                          | No       |

### Security Configuration

| Variable                   | Type    | Default               | Description                    | Required |
| -------------------------- | ------- | --------------------- | ------------------------------ | -------- |
| `NUXT_PUBLIC_FRONTEND_URL` | string  | http://localhost:3000 | Frontend application URL       | Yes      |
| `NUXT_PUBLIC_ENABLE_CSRF`  | boolean | true                  | Enable CSRF protection         | No       |
| `NUXT_PUBLIC_CSP_ENABLED`  | boolean | true                  | Enable Content Security Policy | No       |

### UI/UX Configuration

| Variable                         | Type    | Default | Description                           | Required |
| -------------------------------- | ------- | ------- | ------------------------------------- | -------- |
| `NUXT_PUBLIC_DEFAULT_PAGE_SIZE`  | integer | 15      | Default pagination size               | No       |
| `NUXT_PUBLIC_MAX_PAGE_SIZE`      | integer | 100     | Maximum pagination size               | No       |
| `NUXT_PUBLIC_SEARCH_DEBOUNCE_MS` | integer | 300     | Search input debounce in milliseconds | No       |

### Development Configuration

| Variable                           | Type    | Default | Description            | Required |
| ---------------------------------- | ------- | ------- | ---------------------- | -------- |
| `NUXT_DEVTOOLS_ENABLED`            | boolean | true    | Enable Nuxt DevTools   | No       |
| `NUXT_PUBLIC_ENABLE_DEBUG_LOGGING` | boolean | true    | Enable debug logging   | No       |
| `NUXT_TELEMETRY_DISABLED`          | boolean | true    | Disable Nuxt telemetry | No       |

## Environment-Specific Configurations

### Development Environment

**Backend (.env):**

```env
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=sqlite
MAIL_MAILER=log
THROTTLE_LOGIN_ATTEMPTS=10
```

**Frontend (.env):**

```env
NODE_ENV=development
NUXT_DEVTOOLS_ENABLED=true
NUXT_PUBLIC_ENABLE_DEBUG_LOGGING=true
```

### Staging Environment

**Backend (.env.staging):**

```env
APP_ENV=staging
APP_DEBUG=true
APP_URL=https://staging-api.yourdomain.com
DB_CONNECTION=mysql
DB_HOST=staging-db-host
MAIL_MAILER=smtp
SESSION_SECURE_COOKIE=true
```

**Frontend (.env.staging):**

```env
NODE_ENV=staging
NUXT_PUBLIC_API_BASE=https://staging-api.yourdomain.com/api
NUXT_DEVTOOLS_ENABLED=false
NUXT_PUBLIC_ENABLE_DEBUG_LOGGING=true
```

### Production Environment

**Backend (.env.production):**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
DB_CONNECTION=mysql
DB_HOST=production-db-host
MAIL_MAILER=smtp
SESSION_SECURE_COOKIE=true
CACHE_STORE=redis
SESSION_DRIVER=redis
```

**Frontend (.env.production):**

```env
NODE_ENV=production
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
NUXT_DEVTOOLS_ENABLED=false
NUXT_PUBLIC_ENABLE_DEBUG_LOGGING=false
```

## Security Considerations

### Secret Generation

Generate secure secrets using these methods:

```bash
# Laravel application key
php artisan key:generate

# Random string for session password (32+ characters)
openssl rand -base64 32

# Random string for API secret
openssl rand -hex 32
```

### Environment-Specific Security

**Development:**

- Use weak passwords for convenience
- Enable debug logging
- Use HTTP for local development

**Staging:**

- Use production-like security settings
- Enable HTTPS
- Use secure passwords
- Enable debug logging for troubleshooting

**Production:**

- Use strong, unique passwords
- Enable HTTPS everywhere
- Disable debug logging
- Enable all security features
- Use secure session cookies

### Sensitive Variables

Never commit these variables to version control:

- `APP_KEY`
- `DB_PASSWORD`
- `MAIL_PASSWORD`
- `NUXT_API_SECRET`
- `NUXT_SESSION_PASSWORD`
- Any API keys or tokens

## Docker Configuration

### Docker Compose Environment

Create a `.env` file for Docker Compose:

```env
# Database
DB_ROOT_PASSWORD=secure_root_password
DB_PASSWORD=secure_user_password

# Mail
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password

# URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000/api
```

### Container Environment Variables

Variables can be set in `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - APP_ENV=production
      - DB_HOST=database
      - REDIS_HOST=redis
```

Or in separate environment files:

```yaml
services:
  backend:
    env_file:
      - .env.backend
  frontend:
    env_file:
      - .env.frontend
```

## Validation and Testing

### Environment Validation

The application validates critical environment variables on startup:

**Backend validation:**

- Checks for required variables
- Validates database connection
- Verifies mail configuration

**Frontend validation:**

- Validates API base URL format
- Checks for required secrets
- Verifies session configuration

### Testing Environment Variables

Use separate environment files for testing:

**Backend (.env.testing):**

```env
APP_ENV=testing
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
MAIL_MAILER=array
CACHE_DRIVER=array
SESSION_DRIVER=array
```

**Frontend (.env.test):**

```env
NODE_ENV=test
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

## Troubleshooting

### Common Issues

1. **Missing APP_KEY:**

   ```bash
   php artisan key:generate
   ```

2. **Database Connection Failed:**

   - Check `DB_*` variables
   - Verify database server is running
   - Test connection: `php artisan tinker` then `DB::connection()->getPdo()`

3. **Mail Configuration Issues:**

   - Verify SMTP credentials
   - Check firewall settings
   - Test with `MAIL_MAILER=log` first

4. **Frontend API Connection:**
   - Verify `NUXT_PUBLIC_API_BASE` URL
   - Check CORS configuration
   - Ensure backend is running

### Environment Debugging

**Backend:**

```bash
# Check configuration
php artisan config:show

# Test database connection
php artisan tinker
>>> DB::connection()->getPdo()

# Test mail configuration
php artisan tinker
>>> Mail::raw('Test', function($msg) { $msg->to('test@example.com'); })
```

**Frontend:**

```bash
# Check environment variables
npm run dev -- --verbose

# Test API connection
curl http://localhost:8000/api/health
```

## Best Practices

1. **Use environment-specific files** (`.env.local`, `.env.staging`, `.env.production`)
2. **Never commit `.env` files** to version control
3. **Use strong, unique secrets** for each environment
4. **Regularly rotate secrets** and API keys
5. **Validate environment variables** on application startup
6. **Document all variables** and their purposes
7. **Use consistent naming conventions**
8. **Group related variables** together
9. **Provide sensible defaults** where possible
10. **Test configuration changes** in staging first
