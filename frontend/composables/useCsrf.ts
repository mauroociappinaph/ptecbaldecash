/**
 * CSRF token management composable
 * Handles CSRF token retrieval and validation for API requests
 */
export const useCsrf = () => {
  /**
   * Get CSRF token from various sources
   */
  const getCsrfToken = (): string | null => {
    // Try to get from meta tag first
    if (import.meta.client) {
      const metaToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      if (metaToken) {
        return metaToken;
      }

      // Try to get from cookie
      const cookieToken = useCookie("XSRF-TOKEN");
      if (cookieToken.value) {
        return cookieToken.value;
      }
    }

    return null;
  };

  /**
   * Set CSRF token in meta tag
   */
  const setCsrfToken = (token: string) => {
    if (import.meta.client) {
      let metaTag = document.querySelector(
        'meta[name="csrf-token"]'
      ) as HTMLMetaElement;

      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.name = "csrf-token";
        document.head.appendChild(metaTag);
      }

      metaTag.content = token;
    }
  };

  /**
   * Fetch CSRF token from backend
   */
  const fetchCsrfToken = async (): Promise<string | null> => {
    try {
      const config = useRuntimeConfig();

      // First try to get CSRF cookie from Sanctum
      await $fetch("/sanctum/csrf-cookie", {
        baseURL: config.public.apiBase.replace("/api", ""),
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      // Then try to get the token from cookie
      const cookieToken = useCookie("XSRF-TOKEN");
      if (cookieToken.value) {
        setCsrfToken(cookieToken.value);
        return cookieToken.value;
      }

      // Fallback: try to get from custom endpoint
      const response = await $fetch<{ csrf_token: string }>("/csrf-token", {
        baseURL: config.public.apiBase.replace("/api", ""),
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (response.csrf_token) {
        setCsrfToken(response.csrf_token);
        return response.csrf_token;
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }

    return null;
  };

  /**
   * Ensure CSRF token is available
   */
  const ensureCsrfToken = async (): Promise<string | null> => {
    let token = getCsrfToken();

    if (!token) {
      token = await fetchCsrfToken();
    }

    return token;
  };

  return {
    getCsrfToken,
    setCsrfToken,
    fetchCsrfToken,
    ensureCsrfToken,
  };
};
