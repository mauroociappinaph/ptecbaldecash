import { defineEventHandler, createError, deleteCookie } from "h3";

/**
 * Server-side logout handler
 * Clears user session and handles logout
 */
export default defineEventHandler(async (event) => {
  try {
    // Clear user session by deleting the session cookie
    deleteCookie(event, "nuxt-session"); // Assuming 'nuxt-session' is your session cookie name

    return { success: true, message: "Logged out successfully" };
  } catch (error: any) {
    console.error("Logout error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Logout failed",
    });
  }
});