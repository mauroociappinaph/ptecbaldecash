/**
 * Security utilities for frontend input sanitization and validation
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== "string") {
    return "";
  }

  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Normalize multiple spaces to single space
  sanitized = sanitized.replace(/\s+/g, " ");

  return sanitized;
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== "string") {
    return "";
  }

  // Remove null bytes and control characters
  let sanitized = email.replace(/[\x00-\x1F\x7F]/g, "");

  // Trim whitespace and convert to lowercase
  sanitized = sanitized.trim().toLowerCase();

  return sanitized;
};

/**
 * Sanitize name input (allows letters, spaces, hyphens, apostrophes)
 */
export const sanitizeName = (name: string): string => {
  if (typeof name !== "string") {
    return "";
  }

  // Remove null bytes and control characters
  let sanitized = name.replace(/[\x00-\x1F\x7F]/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Normalize multiple spaces to single space
  sanitized = sanitized.replace(/\s+/g, " ");

  // Remove any characters that aren't letters, spaces, hyphens, or apostrophes
  sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿñÑ\s\-']/g, "");

  // Capitalize first letter of each word
  sanitized = sanitized.replace(/\b\w/g, (char) => char.toUpperCase());

  return sanitized;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Escape HTML to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Check if a URL is safe (same origin or allowed external)
 */
export const isSafeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);

    // Allow same origin
    if (urlObj.origin === window.location.origin) {
      return true;
    }

    // Allow specific external domains (add as needed)
    const allowedDomains = ["localhost:8000", "127.0.0.1:8000"];

    return allowedDomains.some((domain) => urlObj.host === domain);
  } catch {
    return false;
  }
};

/**
 * Generate a secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

/**
 * Rate limiting helper for client-side
 */
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests: number[] = [];

  return {
    canMakeRequest(): boolean {
      const now = Date.now();

      // Remove old requests outside the window
      while (requests.length > 0) {
        const first = requests[0];
        if (typeof first === "number" && first <= now - windowMs) {
          requests.shift();
        } else {
          break;
        }
      }

      // Check if we can make a new request
      if (requests.length < maxRequests) {
        requests.push(now);
        return true;
      }

      return false;
    },

    getRemainingRequests(): number {
      const now = Date.now();

      // Remove old requests outside the window
      while (requests.length > 0) {
        const first = requests[0];
        if (typeof first === "number" && first <= now - windowMs) {
          requests.shift();
        } else {
          break;
        }
      }

      return Math.max(0, maxRequests - requests.length);
    },

    getResetTime(): number {
      const first = requests[0];
      if (typeof first === "number") {
        return first + windowMs;
      }
      return 0;
    },
  };
};
