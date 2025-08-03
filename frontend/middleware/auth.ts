/**
 * Authentication middleware
 * Ensures user is authenticated before accessing protected routes
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side during initial render to avoid hydration issues
  if (process.server) {
    return;
  }

  try {
    // Check authentication status by trying to fetch user data
    const user = await $fetch("/api/user", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }).catch(() => null);

    // If user is not authenticated, redirect to login page with return URL
    if (!user) {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }
  } catch (error) {
    // If there's an error checking auth, redirect to login
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
