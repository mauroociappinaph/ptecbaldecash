/**
 * Centralized logging service for the application
 * Provides structured logging with different levels and contexts
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: string;
  args?: any[];
}

/**
 * Create a logger instance for a specific context
 */
export const createLogger = (context: string): Logger => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const formatMessage = (level: LogLevel, message: string): string => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  };

  const log = (level: LogLevel, message: string, ...args: any[]): void => {
    const formattedMessage = formatMessage(level, message);

    // Store log entry for potential reporting
    const logEntry: LogEntry = {
      level,
      context,
      message,
      timestamp: new Date().toISOString(),
      args: args.length > 0 ? args : undefined,
    };

    // Console output based on level
    switch (level) {
      case "debug":
        if (isDevelopment) {
          console.debug(formattedMessage, ...args);
        }
        break;
      case "info":
        console.info(formattedMessage, ...args);
        break;
      case "warn":
        console.warn(formattedMessage, ...args);
        break;
      case "error":
        console.error(formattedMessage, ...args);
        // In production, you might want to send errors to a logging service
        if (!isDevelopment) {
          // sendToLoggingService(logEntry);
        }
        break;
    }
  };

  return {
    debug: (message: string, ...args: any[]) => log("debug", message, ...args),
    info: (message: string, ...args: any[]) => log("info", message, ...args),
    warn: (message: string, ...args: any[]) => log("warn", message, ...args),
    error: (message: string, ...args: any[]) => log("error", message, ...args),
  };
};

/**
 * Global logger instance
 */
export const useLogger = (context: string = "App"): Logger => {
  return createLogger(context);
};
