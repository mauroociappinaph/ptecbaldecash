/**
 * Administrator role middleware
 * Ensures user has administrator role before accessing admin-only routes
 */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user: session } = useUserSession();

  // First check if user is authenticated
  if (!loggedIn.value) {
    return navigateTo("/login");
  }

  // Check if user has administrator role
  if (
    !session.value ||
    !("user" in session.value) ||
    (session.value as any).user.role !== "administrator"
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied. Administrator role required.",
    });
  }
});
