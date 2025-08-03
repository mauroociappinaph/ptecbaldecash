/**
 * Guest middleware
 * Redirects authenticated users away from guest-only pages (like login)
 */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  // If user is already logged in, redirect to dashboard/users page
  if (loggedIn.value) {
    return navigateTo("/users");
  }
});
