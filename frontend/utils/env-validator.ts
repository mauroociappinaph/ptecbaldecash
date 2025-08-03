/**
 * Environment variable validation utilities
 */

interface EnvConfig {
  [key: string]: {
    required: boolean;
    defaultValue?: string;
    validator?: (value: string) => boolean;
    description?: string;
  };
}

const ENV_CONFIG: EnvConfig = {
  NUXT_SESSION_PASSWORD: {
    required: true,
    description: "Session password for authentication",
    validator: (value: string) => value.length >= 32,
  },
  NUXT_PUBLIC_API_BASE: {
    required: false,
    defaultValue: "http://localhost:8000/api",
    description: "Base URL for API requests",
    validator: (value: string) => /^https?:\/\/.+/.test(value),
  },
  NUXT_PUBLIC_APP_NAME: {
    required: false,
    defaultValue: "User Management System",
    description: "Application name",
  },
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Record<string, string>;
}

/**
 * Validate environment variables according to configuration
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Record<string, string> = {};

  for (const [key, envConfig] of Object.entries(ENV_CONFIG)) {
    const value = process.env[key];

    if (!value) {
      if (envConfig.required) {
        errors.push(`Missing required environment variable: ${key}`);
        if (envConfig.description) {
          errors.push(`  Description: ${envConfig.description}`);
        }
      } else if (envConfig.defaultValue) {
        config[key] = envConfig.defaultValue;
        warnings.push(
          `Using default value for ${key}: ${envConfig.defaultValue}`
        );
      }
    } else {
      // Validate the value if validator is provided
      if (envConfig.validator && !envConfig.validator(value)) {
        errors.push(`Invalid value for environment variable: ${key}`);
        if (envConfig.description) {
          errors.push(`  Description: ${envConfig.description}`);
        }
      } else {
        config[key] = value;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Log validation results in a user-friendly format
 */
export function logValidationResults(result: ValidationResult): void {
  if (!result.isValid) {
    console.error("❌ Environment validation failed:");
    result.errors.forEach((error) => console.error(`  ${error}`));
    console.error(
      "\nPlease check your .env file and ensure all required variables are set."
    );
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    result.warnings.forEach((warning) => console.warn(`  ${warning}`));
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log("✅ Environment validation passed");
  }
}
