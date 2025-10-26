import { createClient } from '@insforge/sdk';

// Initialize InsForge client
export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL
});

// Check if user is authenticated
export const getCurrentUser = async () => {
  const { data, error } = await insforge.auth.getCurrentUser();
  return { data, error };
};

// Get current session from local storage
export const getSession = () => {
  const { data } = insforge.auth.getCurrentSession();
  return data?.session;
};

