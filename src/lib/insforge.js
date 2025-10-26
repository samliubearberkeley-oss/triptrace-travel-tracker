import { createClient } from '@insforge/sdk';

// Initialize InsForge client
export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL
});

// Check if user is authenticated
export const getCurrentUser = async () => {
  try {
    const { data, error } = await insforge.auth.getCurrentUser();
    return { data, error };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { data: null, error };
  }
};

// Get current session from local storage
export const getSession = () => {
  try {
    const { data } = insforge.auth.getCurrentSession();
    return data?.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

