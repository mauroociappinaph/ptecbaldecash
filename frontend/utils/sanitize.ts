/**
 * Input sanitization utilities
 * Provides functions to sanitize user input and prevent XSS attacks
 */

/**
 * Escape HTML characters to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Sanitize name input (remove special characters)
 */
export const sanitizeName = (name: string): string => {
  return name.replace(/[<>\"'&]/g, "").trim();
};

/**
 * Validate and sanitize user input data
 */
export const sanitizeUserData = (data: {
  name?: string;
  last_name?: string;
  email?: string;
  [key: string]: any;
}) => {
  const sanitized = { ...data };

  if (sanitized.name) {
    sanitized.name = sanitizeName(sanitized.name);
  }

  if (sanitized.last_name) {
    sanitized.last_name = sanitizeName(sanitized.last_name);
  }

  if (sanitized.email) {
    sanitized.email = sanitizeEmail(sanitized.email);
  }

  return sanitized;
};
