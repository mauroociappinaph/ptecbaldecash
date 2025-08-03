export const useUserSession = () => {
  // Simple reactive state for user session
  const user = ref(null);
  const loggedIn = computed(() => !!user.value);

  const clear = async () => {
    user.value = null;
  };

  const fetch = async () => {
    // This would normally fetch user data from the server
    // For now, we'll just return the current user
    return user.value;
  };

  return {
    user,
    loggedIn,
    clear,
    fetch,
  };
};
