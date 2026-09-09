import { createContext, useContext } from 'react';
export const NotificationContext = createContext(null);
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('Notifications require the signed-in portal');
  return context;
}
