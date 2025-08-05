/**
 * Service container for dependency injection
 * Provides centralized access to all application services
 */

export interface ServiceContainer {
  apiService: ReturnType<typeof useApi>;
  cacheService: ReturnType<typeof useApiCache>;
  logger: ReturnType<typeof useLogger>;
}

/**
 * Create service container with all dependencies
 */
const createServiceContainer = (): ServiceContainer => ({
  apiService: useApi(),
  cacheService: useApiCache(),
  logger: useLogger("Services"),
});

/**
 * Service container key for injection
 */
export const SERVICE_CONTAINER_KEY = Symbol("ServiceContainer");

/**
 * Provide services to the application
 */
export const provideServices = (): ServiceContainer => {
  const services = createServiceContainer();
  provide(SERVICE_CONTAINER_KEY, services);
  return services;
};

/**
 * Use services with dependency injection
 */
export const useServices = (): ServiceContainer => {
  const services = inject<ServiceContainer>(SERVICE_CONTAINER_KEY);

  if (!services) {
    // Fallback to creating services if not provided
    console.warn(
      "Services not provided via dependency injection, creating new instance"
    );
    return createServiceContainer();
  }

  return services;
};

/**
 * Composable for specific service access
 */
export const useApiService = () => {
  const { apiService } = useServices();
  return apiService;
};

export const useCacheService = () => {
  const { cacheService } = useServices();
  return cacheService;
};

export const useAppLogger = (context?: string) => {
  if (context) {
    return useLogger(context);
  }
  const { logger } = useServices();
  return logger;
};
