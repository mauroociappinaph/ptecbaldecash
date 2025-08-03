/**
 * Toast notification composable
 * Provides a global toast notification system
 */

export interface ToastOptions {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  persistent?: boolean;
  actionText?: string;
  onAction?: () => void;
}

// Global toast container reference
let toastContainer: any = null;

export const useToast = () => {
  // Set the toast container reference (called from the app)
  const setToastContainer = (container: any) => {
    console.log("🔍 useToast: Setting toast container:", !!container);
    toastContainer = container;
  };

  // Show a toast notification
  const showToast = (options: ToastOptions): string | null => {
    console.log("🔍 useToast: Attempting to show toast:", options);
    if (!toastContainer) {
      console.warn("🚨 useToast: Toast container not initialized");
      return null;
    }

    const result = toastContainer.addToast(options);
    console.log("🔍 useToast: Toast added with ID:", result);
    return result;
  };

  // Convenience methods for different toast types
  const success = (message: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: "success",
      message,
      ...options,
    });
  };

  const error = (message: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: "error",
      message,
      persistent: true, // Errors should be persistent by default
      ...options,
    });
  };

  const warning = (message: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: "warning",
      message,
      ...options,
    });
  };

  const info = (message: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: "info",
      message,
      ...options,
    });
  };

  // Remove a specific toast
  const removeToast = (id: string) => {
    if (toastContainer) {
      toastContainer.removeToast(id);
    }
  };

  // Clear all toasts
  const clearToasts = () => {
    if (toastContainer) {
      toastContainer.clearToasts();
    }
  };

  return {
    setToastContainer,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearToasts,
  };
};
