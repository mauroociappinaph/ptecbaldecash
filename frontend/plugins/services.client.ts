/**
 * Services plugin for dependency injection
 * Initializes and provides services to the entire application
 */

export default defineNuxtPlugin(() => {
  // Initialize services container
  const services = provideServices();

  // Log initialization
  const logger = services.logger;
  logger.info("Services initialized successfully");

  // Provide global error handler
  const errorHandler = (error: Error) => {
    logger.error("Global error caught:", error);
  };

  // Set up global error handling
  if (import.meta.client) {
    window.addEventListener("error", (event) => {
      errorHandler(new Error(event.message));
    });

    window.addEventListener("unhandledrejection", (event) => {
      errorHandler(new Error(event.reason));
    });
  }

  return {
    provide: {
      services,
      errorHandler,
    },
  };
});
