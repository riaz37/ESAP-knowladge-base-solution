import { useContext } from 'react';
import { UserContext } from '@/components/providers';

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}

// Re-export the context for direct access if needed
export { UserContext } from '@/components/providers';