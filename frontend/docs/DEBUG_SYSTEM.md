# Debug System Documentation

## Overview

The debug system provides centralized, configurable logging and debugging capabilities for the Nuxt.js application. It's designed to be performance-aware and production-safe.

## Architecture

### Core Components

1. **Debug Manager** (`utils/debug.ts`) - Centralized debug utility
2. **Debug Middleware** (`middleware/debug.global.ts`) - Route debugging
3. **Router Debug Plugin** (`plugins/router-debug.client.ts`) - Router-specific debugging
4. **Early Debug Plugin** (`plugins/00.early-debug.client.ts`) - Early error detection
5. **Debug Config Plugin** (`plugins/debug-config.client.ts`) - Environment-based configuration

### Features

- **Configurable Log Levels**: error, warn, info, debug
- **Module-Specific Logging**: router, middleware, components, api
- **Performance Timing**: Built-in timing utilities
- **Production Safety**: Automatically disabled in production
- **Type Safety**: Full TypeScript support

## Usage

### Basic Logging

```typescript
import { debugManager } from "~/utils/debug";

// Different log levels
debugManager.error("Something went wrong", errorData);
debugManager.warn("Warning message", warningData);
debugManager.info("Info message", infoData);
debugManager.debug("Debug message", debugData);

// Module-specific logging
debugManager.info("API request completed", responseData, "api");
debugManager.debug("Component mounted", componentData, "components");
```

### Performance Timing

```typescript
import { debugManager } from "~/utils/debug";

// Start timing
debugManager.time("api-request");

// ... perform operation

// End timing
debugManager.timeEnd("api-request");
```

### Configuration

The debug system can be configured via environment variables:

```env
# Enable debug mode in production
NUXT_DEBUG=true

# Development mode (automatically enables debug)
NODE_ENV=development
```

### Programmatic Configuration

```typescript
import { debugManager } from "~/utils/debug";

debugManager.setConfig({
  enabled: true,
  logLevel: "info",
  modules: {
    router: true,
    middleware: false,
    components: true,
    api: true,
  },
});
```

## Debug Modules

### Router Module

- Route changes and navigation
- Route matching and errors
- Available routes listing

### Middleware Module

- Middleware execution
- Route protection
- Authentication checks

### Components Module

- Component lifecycle events
- Component errors
- Props and state changes

### API Module

- HTTP requests and responses
- API errors
- Request timing

## Performance Considerations

- **Zero Runtime Cost in Production**: Debug code is completely disabled when not needed
- **Lazy Evaluation**: Debug data is only computed when logging is enabled
- **Memory Efficient**: No debug data accumulation in production
- **Configurable Verbosity**: Control log levels to reduce noise

## Best Practices

1. **Use Appropriate Log Levels**:

   - `error`: Critical issues that need immediate attention
   - `warn`: Potential issues or deprecated usage
   - `info`: General information about application flow
   - `debug`: Detailed debugging information

2. **Include Context Data**:

   ```typescript
   // Good
   debugManager.error("API request failed", {
     url: "/api/users",
     status: 500,
     error: errorMessage,
   });

   // Less helpful
   debugManager.error("API request failed");
   ```

3. **Use Module Tags**:

   ```typescript
   // Helps filter logs by functionality
   debugManager.info("User authenticated", userData, "auth");
   debugManager.debug("Component rendered", componentData, "components");
   ```

4. **Performance Timing for Slow Operations**:
   ```typescript
   debugManager.time("database-query");
   const result = await performDatabaseQuery();
   debugManager.timeEnd("database-query");
   ```

## Migration from Console Logging

Replace direct console calls with debug manager:

```typescript
// Before
console.log("🔍 Route changed:", to.path);
console.error("🚨 Route not found:", path);

// After
debugManager.info("Route changed", { path: to.path }, "router");
debugManager.error("Route not found", { path }, "router");
```

## Troubleshooting

### Debug Not Working

1. Check `NODE_ENV` is set to 'development'
2. Verify `NUXT_DEBUG=true` if in production
3. Check module configuration in debug config

### Too Much Debug Output

1. Adjust log level: `debugManager.setConfig({ logLevel: 'warn' })`
2. Disable specific modules: `debugManager.setConfig({ modules: { router: false } })`

### Performance Issues

1. Ensure debug is disabled in production
2. Use appropriate log levels
3. Avoid expensive computations in debug calls
